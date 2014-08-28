var _ = require('../util')
var textParser = require('../parse/text')
var expParser = require('../parse/expression')
var templateParser = require('../parse/template')
var compile = require('../compile/compile')
var transclude = require('../compile/transclude')
var uid = 0

module.exports = {

  /**
   * Setup.
   */

  bind: function () {
    // uid as a cache identifier
    this.id = '__v_repeat_' + (++uid)
    // put in the default filter to guard Object values
    // this filter needs to always be the first one. We
    // can do this in bind because the watcher is not
    // created yet.
    if (!this.filters) {
      this.filters = []
    }
    this.filters.unshift({ name: '_objToArray' })
    // check other directives that need to be handled
    // at v-repeat level
    this.checkIf()
    this.checkRef()
    this.checkComponent()
    // setup ref node
    this.ref = document.createComment('v-repeat')
    _.replace(this.el, this.ref)
    // check if this is a block repeat
    if (this.el.tagName === 'TEMPLATE') {
      this.el = templateParser.parse(this.el)
    }
  },

  /**
   * Warn against v-if usage.
   */

  checkIf: function () {
    if (_.attr(this.el, 'if') !== null) {
      _.warn(
        'Don\'t use v-if with v-repeat. ' +
        'Use v-show or the "filterBy" filter instead.'
      )
    }
  },

  /**
   * Check if v-ref is also present. If yes, evaluate it and
   * locate the first non-anonymous parent as the owner vm.
   */

  checkRef: function () {
    var childId = _.attr(this.el, 'ref')
    this.childId = childId
      ? this.vm.$interpolate(childId)
      : null
    if (this.childId) {
      var owner = this.vm.$parent
      while (owner._isAnonymous) {
        owner = owner.$parent
      }
      this.owner = owner
    }
  },

  /**
   * Check the component constructor to use for repeated
   * instances. If static we resolve it now, otherwise it
   * needs to be resolved at build time with actual data.
   */

  checkComponent: function () {
    var id = _.attr(this.el, 'component')
    if (!id) {
      this.Ctor = _.Vue // default constructor
    } else {
      var tokens = textParser.parse(id)
      if (!tokens) { // static component
        var Ctor = this.Ctor = this.vm.$options.components[id]
        _.assertAsset(Ctor, 'component', id)
        if (Ctor) {
          this.el = transclude(this.el, Ctor.options)
          this._linker = compile(this.el, Ctor.options)
        }
      } else if (tokens.length === 1) {
        // to be resolved later
        this.CtorExp = tokens[0].value
      } else {
        _.warn(
          'Invalid attribute binding: "' +
           'component="' + id + '"' +
          '\nDon\'t mix binding tags with plain text ' +
          'in attribute bindings.'
        )
      }
    }
  },

  /**
   * Update.
   * This is called whenever the Array mutates.
   *
   * @param {Array} data
   */

  update: function (data) {
    if (data && !_.isArray(data)) {
      _.warn(
        'Invalid value for v-repeat:' + data +
        '\nExpects Object or Array.'
      )
      return
    }
    this.converted = data._converted
    this.vms = this.diff(data || [], this.vms)
    // update v-ref
    if (this.childId) {
      this.owner.$[this.childId] = this.vms
    }
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   * @param {Array} oldVms
   * @return {Array}
   */

  diff: function (data, oldVms) {
    var converted = this.converted
    var vms = new Array(data.length)
    var ref = this.ref
    var obj, raw, vm, i, l
    // First pass, go through the new Array and fill up
    // the new vms array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      obj = data[i]
      raw = converted ? obj.value : obj
      vm = this.getVm(raw)
      if (vm) { // reusable instance
        vm._reused = true
        vm.$index = i // update $index
        if (converted) {
          vm.$key = obj.key // update $key
        }
      } else { // new instance
        vm = this.build(obj, i)
      }
      vms[i] = vm
      // insert if this is first run
      if (!oldVms) {
        vm.$before(ref)
      }
    }
    // if this is the first run, we're done.
    if (!oldVms) {
      return vms
    }
    // Second pass, go through the old vm instances and
    // destroy those who are not reused (and remove them
    // from cache)
    for (i = 0, l = oldVms.length; i < l; i++) {
      vm = oldVms[i]
      if (!vm._reused) {
        this.uncacheVm(vm)
        vm.$destroy(true)
      }
    }
    // final pass, move/insert new instances into the
    // right place. We're going in reverse here because
    // insertBefore relies on the next sibling to be
    // resolved.
    var targetNext, currentNext, nextEl
    i = vms.length
    while (i--) {
      vm = vms[i]
      // this is the vm that we should be in front of
      targetNext = vms[i + 1]
      if (!targetNext) {
        // This is the last item, just insert before the
        // ref node. However we only want animation for
        // newly created instances.
        vm.$before(ref, null, !vm._reused)
      } else {
        if (vm._reused) {
          // this is the vm we are actually in front of
          currentNext = findNextVm(vm, ref)
          // we only need to move if we are not in the right
          // place already.
          if (currentNext !== targetNext) {
            nextEl = findNextInDOMVmEl(targetNext, vms, ref)
            vm.$before(nextEl, null, false)
          }
        } else {
          // new instance, insert to existing next
          vm.$before(targetNext.$el)
        }
      }
      vm._reused = false
    }
    return vms
  },

  /**
   * Build a new instance and cache it.
   *
   * @param {Object} data
   * @param {Number} index
   */

  build: function (data, index) {
    var original = data
    var raw = this.converted
      ? data.value
      : data
    var isObject = raw && typeof raw === 'object'
    var alias = this.arg
    var hasAlias = !isObject || alias
    // wrap the raw data with alias
    data = hasAlias ? {} : raw
    if (alias) {
      data[alias] = raw
    }
    // resolve constructor
    var Ctor = this.Ctor || this.resolveCtor(data)
    var vm = this.vm._addChild({
      el: this.el.cloneNode(true),
      _linker: this._linker,
      data: data,
      parent: this.vm
    }, Ctor)
    // define alias
    if (hasAlias && !alias) {
      vm._defineMeta('$value', raw)
    }
    // define key
    if (this.converted) {
      vm._defineMeta('$key', original.key)
    }
    // define index
    vm._defineMeta('$index', index)
    // cache instance
    if (isObject) {
      this.cacheVm(raw, vm)
    }
    return vm
  },

  /**
   * Resolve a contructor to use for an instance.
   * The tricky part here is that there could be dynamic
   * components depending on instance data.
   *
   * @param {Object} data
   * @return {Function}
   */

  resolveCtor: function (data) {
    var getter = expParser.parse(this.CtorExp).get
    var context = Object.create(this.vm)
    for (var key in data) {
      // use _.define to avoid accidentally
      // overwriting scope properties
      _.define(context, key, data[key])
    }
    var id = getter(context)
    var Ctor = this.vm.$options.components[id]
    _.assertAsset(Ctor, 'component', id)
    return Ctor
  },

  /**
   * Unbind, teardown everything
   */

  unbind: function () {
    if (this.childId) {
      delete this.owner.$[this.childId]
    }
    if (this.vms) {
      var i = this.vms.length
      var vm
      while (i--) {
        vm = this.vms[i]
        this.uncacheVm(vm)
        vm.$destroy()
      }
    }
  },

  /**
   * Save a vm's reference on a data object as a hidden
   * property. This mimics a Map that allows us to determine
   * a data object's owner instance during the diff phase.
   *
   * @param {Object} data
   * @param {Vue} vm
   */

  cacheVm: function (data, vm) {
    if (data.hasOwnProperty(this.id)) {
      data[this.id] = vm
    } else {
      _.define(data, this.id, vm)
    }
    vm._raw = data
  },

  /**
   * Try to get a cached instance from a piece of data.
   *
   * @param {Object} data
   * @return {Vue|undefined}
   */

  getVm: function (data) {
    return data[this.id]
  },

  /**
   * Delete a cached vm instance.
   * This assumes the data already has a vm cached on it.
   *
   * @param {Vue} vm
   */

  uncacheVm: function (vm) {
    if (vm._raw) {
      vm._raw[this.id] = null
      vm._raw = null
    }
  }

}

/**
 * Helper to find the next element that is an instance
 * root node. This is necessary because a destroyed vm's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its __vue__ reference
 * should have been removed so we can skip them.
 *
 * @param {Vue} vm
 * @param {CommentNode} ref
 * @return {Vue}
 */

function findNextVm (vm, ref) {
  var el = (vm._isBlock
    ? vm._blockEnd
    : vm.$el).nextSibling
  while (!el.__vue__ && el !== ref) {
    el = el.nextSibling
  }
  return el.__vue__
}

/**
 * Helper to find the next vm that is already in the DOM
 * and return its $el. This is necessary because newly
 * inserted vms might not be in the DOM yet due to entering
 * transitions.
 *
 * @param {Vue} next
 * @param {Array} vms
 * @param {CommentNode} ref
 * @return {Element}
 */

function findNextInDOMVmEl (next, vms, ref) {
  var el = next.$el
  while (!el.parentNode) {
    next = vms[next.$index + 1]
    el = next ? next.$el : ref
  }
  return el
}