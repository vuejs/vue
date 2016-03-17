import Watcher from '../../watcher'
import { del, toArray } from '../../util/index'
import { parseText } from '../../parsers/text'
import { parseDirective } from '../../parsers/directive'
import { getPath } from '../../parsers/path'
import { isSimplePath, parseExpression } from '../../parsers/expression'

const filterRE = /[^|]\|[^|]/

export default function (Vue) {
  /**
   * Get the value from an expression on this vm.
   *
   * @param {String} exp
   * @param {Boolean} [asStatement]
   * @return {*}
   */

  Vue.prototype.$get = function (exp, asStatement) {
    var res = parseExpression(exp)
    if (res) {
      if (asStatement && !isSimplePath(exp)) {
        var self = this
        return function statementHandler () {
          self.$arguments = toArray(arguments)
          var result = res.get.call(self, self)
          self.$arguments = null
          return result
        }
      } else {
        try {
          return res.get.call(this, this)
        } catch (e) {}
      }
    }
  }

  /**
   * Set the value from an expression on this vm.
   * The expression must be a valid left-hand
   * expression in an assignment.
   *
   * @param {String} exp
   * @param {*} val
   */

  Vue.prototype.$set = function (exp, val) {
    var res = parseExpression(exp, true)
    if (res && res.set) {
      res.set.call(this, this, val)
    }
  }

  /**
   * Delete a property on the VM
   *
   * @param {String} key
   */

  Vue.prototype.$delete = function (key) {
    del(this._data, key)
  }

  /**
   * Watch an expression, trigger callback when its
   * value changes.
   *
   * @param {String|Function} expOrFn
   * @param {Function} cb
   * @param {Object} [options]
   *                 - {Boolean} deep
   *                 - {Boolean} immediate
   * @return {Function} - unwatchFn
   */

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this
    var parsed
    if (typeof expOrFn === 'string') {
      parsed = parseDirective(expOrFn)
      expOrFn = parsed.expression
    }
    var watcher = new Watcher(vm, expOrFn, cb, {
      deep: options && options.deep,
      sync: options && options.sync,
      filters: parsed && parsed.filters,
      user: !options || options.user !== false
    })
    if (options && options.immediate) {
      cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }

  /**
   * Evaluate a text directive, including filters.
   *
   * @param {String} text
   * @param {Boolean} [asStatement]
   * @return {String}
   */

  Vue.prototype.$eval = function (text, asStatement) {
    // check for filters.
    if (filterRE.test(text)) {
      var dir = parseDirective(text)
      // the filter regex check might give false positive
      // for pipes inside strings, so it's possible that
      // we don't get any filters here
      var val = this.$get(dir.expression, asStatement)
      return dir.filters
        ? this._applyFilters(val, null, dir.filters)
        : val
    } else {
      // no filter
      return this.$get(text, asStatement)
    }
  }

  /**
   * Interpolate a piece of template text.
   *
   * @param {String} text
   * @return {String}
   */

  Vue.prototype.$interpolate = function (text) {
    var tokens = parseText(text)
    var vm = this
    if (tokens) {
      if (tokens.length === 1) {
        return vm.$eval(tokens[0].value) + ''
      } else {
        return tokens.map(function (token) {
          return token.tag
            ? vm.$eval(token.value)
            : token.value
        }).join('')
      }
    } else {
      return text
    }
  }

  /**
   * Log instance data as a plain JS object
   * so that it is easier to inspect in console.
   * This method assumes console is available.
   *
   * @param {String} [path]
   */

  Vue.prototype.$log = function (path) {
    var data = path
      ? getPath(this._data, path)
      : this._data
    if (data) {
      data = clean(data)
    }
    // include computed fields
    if (!path) {
      var key
      for (key in this.$options.computed) {
        data[key] = clean(this[key])
      }
      if (this._props) {
        for (key in this._props) {
          data[key] = clean(this[key])
        }
      }
    }
    console.log(data)
  }

  /**
   * "clean" a getter/setter converted object into a plain
   * object copy.
   *
   * @param {Object} - obj
   * @return {Object}
   */

  function clean (obj) {
    return JSON.parse(JSON.stringify(obj))
  }
}
