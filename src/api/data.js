var expParser = require('../parse/expression')
var textParser = require('../parse/text')
var Watcher = require('../watcher')

/**
 * Get the value from an expression on this vm.
 *
 * @param {String} exp
 * @return {*}
 */

exports.$get = function (exp) {
  var res = expParser.parse(exp)
  if (res) {
    return res.get.call(this, this.$scope)
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
    res.set.call(this, this.$scope, val)
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
  this.$scope.$add(key, val)
}

/**
 * Delete a property on the VM
 * (and also on $scope and $data)
 *
 * @param {String} key
 */

exports.$delete = function (key) {
  this.$scope.$delete(key)
}

/**
 * Watch an expression, trigger callback when its
 * value changes. Returns the created watcher's
 * id so it can be teardown later.
 *
 * @param {String} exp
 * @param {Function} cb
 * @return {Number}
 */

exports.$watch = function (exp, cb) {
  var watcher = new Watcher(this, exp, cb, this)
  this._watchers[watcher.id] = watcher
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
 * Interpolate a piece of template text.
 *
 * @param {String} text
 * @return {String}
 */

exports.$interpolate = function (text) {
  var exp = textParser.textToExpression(text)
  return exp
    ? this.$get(exp)
    : text
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