var _ = require('../util')
var Watcher = require('../watcher')
var textParser = require('../parse/text')
var dirParser = require('../parse/directive')
var expParser = require('../parse/expression')
var filterRE = /[^|]\|[^|]/

/**
 * Get the value from an expression on this vm.
 *
 * @param {String} exp
 * @return {*}
 */

exports.$get = function (exp) {
  var res = expParser.parse(exp)
  if (res) {
    return res.get.call(this, this)
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

exports.$set = function (exp, val) {
  var res = expParser.parse(exp, true)
  if (res && res.set) {
    res.set.call(this, this, val)
  }
}

/**
 * Add a property on the VM
 * (and also on $scope and $data)
 *
 * @param {String} key
 * @param {*} val
 */

exports.$add = function (key, val) {
  if (!_.isReserved(key)) {
    this._data.$add(key, val)
  }
}

/**
 * Delete a property on the VM
 * (and also on $scope and $data)
 *
 * @param {String} key
 */

exports.$delete = function (key) {
  if (!_.isReserved(key)) {
    this._data.$delete(key)
  }
}

/**
 * Watch an expression, trigger callback when its
 * value changes. Returns the created watcher's
 * id so it can be teardown later.
 *
 * @param {String} exp
 * @param {Function} cb
 * @param {Boolean} [immediate]
 * @return {Number}
 */

exports.$watch = function (exp, cb, immediate) {
  var watcher = new Watcher(this, exp, cb, this)
  this._watchers[watcher.id] = watcher
  if (immediate) {
    cb.call(this, watcher.value)
  }
  return watcher.id
}

/**
 * Teardown a watcher with given id.
 *
 * @param {Number} id
 */

exports.$unwatch = function (id) {
  var watcher = this._watchers[id]
  if (watcher) {
    watcher.teardown()
    this._watchers[id] = null
  }
}

/**
 * Evaluate a text directive, including filters.
 *
 * @param {String} text
 * @return {String}
 */

exports.$eval = function (text) {
  // check for filters.
  if (filterRE.test(text)) {
    var dir = dirParser.parse(text)[0]
    // the filter regex check might give false positive
    // for pipes inside strings, so it's possible that
    // we don't get any filters here
    return dir.filters
      ? _.applyFilters(
          this.$get(dir.expression),
          _.resolveFilters(this, dir.filters).read,
          this
        )
      : this.$get(dir.expression)
  } else {
    // no filter
    return this.$get(text)
  }
}

/**
 * Interpolate a piece of template text.
 *
 * @param {String} text
 * @return {String}
 */

exports.$interpolate = function (text) {
  var tokens = textParser.parse(text)
  var vm = this
  if (tokens) {
    return tokens.length === 1
      ? vm.$eval(tokens[0].value)
      : tokens.map(function (token) {
          return token.tag
            ? vm.$eval(token.value)
            : token.value
        }).join('')
  } else {
    return text
  }
}

/**
 * Log instance data as a plain JS object
 * so that it is easier to inspect in console.
 * This method assumes console is available.
 *
 * @param {String} [key]
 */

exports.$log = function (key) {
  var data = this[key || '$data']
  console.log(JSON.parse(JSON.stringify(data)))
}