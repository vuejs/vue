var _ = require('./util')
var Path = require('./parse/path')
var Observer = require('./observe/observer')
var expParser = require('./parse/expression')

/**
 * A directive links a DOM element with a piece of data, which can
 * be either simple paths or computed properties. It subscribes to
 * a list of dependencies (Bindings) and refreshes the list during
 * its getter evaluation.
 *
 * @param {String} type
 * @param {Node} el
 * @param {Vue} vm
 * @param {Object} descriptor
 *                 - {String} arg
 *                 - {String} expression
 *                 - {Array<Object>} filters
 * @constructor
 */

function Directive (type, el, vm, descriptor) {
  // public
  this.type = type
  this.el = el
  this.vm = vm
  this.arg = descriptor.arg
  this.expression = descriptor.expression
  this.filters = descriptor.filters
  this.value = undefined

  // private
  this._deps = Object.create(null)
  this._newDeps = Object.create(null)

  // TODO
  // test for simple path vs. expression
  this._getter = expParser.parse(this.expression)
  this._setter = this._getter.setter

  var self = this

  // add root level path as a dependency.
  // this is specifically for the case where the expression
  // references a non-existing root level path, and later
  // that path is created with `vm.$add`.
  // e.g. "a && a.b"
  var paths = this._getter.paths
  paths.forEach(function (path) {
    if (path.indexOf('.') < 0 && path.indexOf('[') < 0) {
      self._addDep(path)
    }
  })
  this._deps = this._newDeps

  // lock/unlock for setter
  this._locked = false
  this._unlock = function () {
    self._locked = false
  }

  // collect initial dependencies
  this.get()
}

var p = Directive.prototype

/**
 * Add a binding dependency to this directive.
 *
 * @param {String} path
 */

p._addDep = function (path) {
  var vm = this.vm
  var newDeps = this._newDeps
  var oldDeps = this._deps
  if (!newDeps[path]) {
    newDeps[path] = true
    if (!oldDeps[path]) {
      var binding =
        vm._getBindingAt(path, true) ||
        vm._createBindingAt(path, true)
      binding._addSub(this)
    }
  }
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

p.get = function () {
  this._beforeGet()
  var value = this._getter.call(this.vm, this.vm.$scope)
  if (this.filters) {
    value = this._applyFilters(value, -1)
  }
  this._afterGet()
  return value
}

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way bindings like v-model.
 *
 * @param {*} value
 */

p.set = function (value) {
  if (this._setter) {
    this._locked = true
    if (this.filters) {
      value = this._applyFilters(value, 1)
    }
    this._setter.call(this.vm, this.vm.$scope, value)
    _.nextTick(this._unlock)
  }
}

/**
 * Prepare for dependency collection.
 */

p._beforeGet = function () {
  Observer.emitGet = true
  this.vm._targetDir = this
  this._newDeps = Object.create(null)
}

/**
 * Clean up for dependency collection.
 */

p._afterGet = function () {
  this.vm._targetDir = null
  Observer.emitGet = false
  _.extend(this._newDeps, this._deps)
  this._deps = this._newDeps
}

/**
 * The exposed subscriber interface.
 * Will be called when a dependency changes.
 */

p._update = function () {
  this.value = this.get()
  console.log('updated! new value: ' + this.value)
}

/**
 * Apply filters to a value.
 *
 * @param {*} value
 * @param {Number} direction - -1 = read, 1 = write.
 */

p._applyFilters = function (value, direction) {
  if (direction < 0) {
    // TODO read
    return value
  } else {
    // TODO write
    return value
  }
}

/**
 * Remove self from all dependencies' subcriber list.
 */

p._teardown = function () {
  for (var p in this._deps) {
    this._deps[p]._removeSub(this)
  }
}

module.exports = Directive