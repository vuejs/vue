var _ = require('../../util')
var Watcher = require('../../watcher')
var dirParser = require('../../parsers/directive')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el

    // method to force update DOM using latest value.
    this.forceUpdate = function () {
      if (self._watcher) {
        self.update(self._watcher.get())
      }
    }

    // check options param
    var optionsParam = this._checkParam('options')
    if (optionsParam) {
      initOptions.call(this, optionsParam)
    }
    this.number = this._checkParam('number') != null
    this.multiple = el.hasAttribute('multiple')

    // attach listener
    this.on('change', function () {
      var value = getValue(el, self.multiple)
      value = self.number
        ? _.isArray(value)
          ? value.map(_.toNumber)
          : _.toNumber(value)
        : value
      self.set(value)
    })

    // check initial value (inline selected attribute)
    checkInitialValue.call(this)

    // All major browsers except Firefox resets
    // selectedIndex with value -1 to 0 when the element
    // is appended to a new parent, therefore we have to
    // force a DOM update whenever that happens...
    this.vm.$on('hook:attached', this.forceUpdate)
  },

  update: function (value) {
    var el = this.el
    el.selectedIndex = -1
    if (value == null) {
      if (this.defaultOption) {
        this.defaultOption.selected = true
      }
      return
    }
    var multi = this.multiple && _.isArray(value)
    var options = el.options
    var i = options.length
    var op, val
    while (i--) {
      op = options[i]
      val = op.hasOwnProperty('_value')
        ? op._value
        : op.value
      /* eslint-disable eqeqeq */
      op.selected = multi
        ? indexOf(value, val) > -1
        : _.looseEqual(value, val)
      /* eslint-enable eqeqeq */
    }
  },

  unbind: function () {
    this.vm.$off('hook:attached', this.forceUpdate)
    if (this.optionWatcher) {
      this.optionWatcher.teardown()
    }
  }
}

/**
 * Initialize the option list from the param.
 *
 * @param {String} expression
 */

function initOptions (expression) {
  var self = this
  var el = self.el
  var defaultOption = self.defaultOption = self.el.options[0]
  var descriptor = dirParser.parse(expression)[0]
  function optionUpdateWatcher (value) {
    if (_.isArray(value)) {
      // clear old options.
      // cannot reset innerHTML here because IE family get
      // confused during compilation.
      var i = el.options.length
      while (i--) {
        var option = el.options[i]
        if (option !== defaultOption) {
          el.removeChild(option)
        }
      }
      buildOptions(el, value)
      self.forceUpdate()
    } else {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Invalid options value for v-model: ' + value
      )
    }
  }
  this.optionWatcher = new Watcher(
    this.vm,
    descriptor.expression,
    optionUpdateWatcher,
    {
      deep: true,
      filters: descriptor.filters
    }
  )
  // update with initial value
  optionUpdateWatcher(this.optionWatcher.value)
}

/**
 * Build up option elements. IE9 doesn't create options
 * when setting innerHTML on <select> elements, so we have
 * to use DOM API here.
 *
 * @param {Element} parent - a <select> or an <optgroup>
 * @param {Array} options
 */

function buildOptions (parent, options) {
  var op, el
  for (var i = 0, l = options.length; i < l; i++) {
    op = options[i]
    if (!op.options) {
      el = document.createElement('option')
      if (typeof op === 'string') {
        el.text = el.value = op
      } else {
        if (op.value != null && !_.isObject(op.value)) {
          el.value = op.value
        }
        // object values gets serialized when set as value,
        // so we store the raw value as a different property
        el._value = op.value
        el.text = op.text || ''
        if (op.disabled) {
          el.disabled = true
        }
      }
    } else {
      el = document.createElement('optgroup')
      el.label = op.label
      buildOptions(el, op.options)
    }
    parent.appendChild(el)
  }
}

/**
 * Check the initial value for selected options.
 */

function checkInitialValue () {
  var initValue
  var options = this.el.options
  for (var i = 0, l = options.length; i < l; i++) {
    if (options[i].hasAttribute('selected')) {
      if (this.multiple) {
        (initValue || (initValue = []))
          .push(options[i].value)
      } else {
        initValue = options[i].value
      }
    }
  }
  if (typeof initValue !== 'undefined') {
    this._initValue = this.number
      ? _.toNumber(initValue)
      : initValue
  }
}

/**
 * Get select value
 *
 * @param {SelectElement} el
 * @param {Boolean} multi
 * @return {Array|*}
 */

function getValue (el, multi) {
  var res = multi ? [] : null
  var op, val
  for (var i = 0, l = el.options.length; i < l; i++) {
    op = el.options[i]
    if (op.selected) {
      val = op.hasOwnProperty('_value')
        ? op._value
        : op.value
      if (multi) {
        res.push(val)
      } else {
        return val
      }
    }
  }
  return res
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with custom equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf (arr, val) {
  var i = arr.length
  while (i--) {
    if (_.looseEqual(arr[i], val)) {
      return i
    }
  }
  return -1
}
