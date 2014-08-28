var _ = require('./util')
var Observer = require('./observe/observer')
var expParser = require('./parse/expression')
var Binding = require('./binding')
var Batcher = require('./batcher')

var batcher = new Batcher()
var uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String} expression
 * @param {Function} cb
 * @oaram {Object} ctx
 * @param {Array} [filters]
 * @param {Boolean} [needSet]
 * @constructor
 */

function Watcher (vm, expression, cb, ctx, filters, needSet) {
  this.vm = vm
  this.expression = expression
  this.cbs = [cb]
  this.ctxs = [ctx]
  this.id = ++uid // uid for batching
  this.value = undefined
  this.active = true
  this.deps = {}
  this.newDeps = {}
  // setup filters if any.
  // We delegate directive filters here to the watcher
  // because they need to be included in the dependency
  // collection process.
  var res = _.resolveFilters(vm, filters, this)
  this.readFilters = res && res.read
  this.writeFilters = res && res.write
  // parse expression for getter/setter
  res = expParser.parse(expression, needSet)
  this.getter = res.get
  this.setter = res.set
  this.initDeps(res)
}

var p = Watcher.prototype

/**
 * Initialize the value and dependencies.
 *
 * Here we need to add root level path as dependencies.
 * This is specifically for the case where the expression
 * references a non-existing root level path, and later
 * that path is created with `vm.$add`.
 *
 * e.g. in "a && a.b", if `a` is not present at compilation,
 * the directive will end up with no dependency at all and
 * never gets updated.
 *
 * @param {Object} res - expression parser result object
 */

p.initDeps = function (res) {
  var i = res.paths.length
  while (i--) {
    this.addDep(res.paths[i])
  }
  // temporarily set computed to true
  // to force dep collection on first evaluation
  this.isComputed = true
  this.value = this.get()
  var computed = this.vm.$options.computed
  var exp = this.expression
  this.isComputed =
    this.filters || // filters may access instance data
    res.computed || // inline expression
    (computed && computed[exp]) // computed property
}

/**
 * Add a binding dependency to this directive.
 *
 * @param {String} path
 */

p.addDep = function (path) {
  var vm = this.vm
  var newDeps = this.newDeps
  var oldDeps = this.deps
  if (!newDeps[path]) {
    newDeps[path] = true
    if (!oldDeps[path]) {
      var binding =
        vm._bindings[path] ||
        (vm._bindings[path] = new Binding())
      binding._addSub(this)
    }
  }
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

p.get = function () {
  if (this.isComputed) {
    this.beforeGet()
  }
  var vm = this.vm
  var value = this.getter.call(vm, vm)
  value = _.applyFilters(value, this.readFilters, vm)
  if (this.isComputed) {
    this.afterGet()
  }
  return value
}

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

p.set = function (value) {
  var vm = this.vm
  value = _.applyFilters(value, this.writeFilters, vm)
  this.setter.call(vm, vm, value)
}

/**
 * Prepare for dependency collection.
 */

p.beforeGet = function () {
  Observer.emitGet = true
  this.vm._activeWatcher = this
  this.newDeps = {}
}

/**
 * Clean up for dependency collection.
 */

p.afterGet = function () {
  this.vm._activeWatcher = null
  Observer.emitGet = false
  _.extend(this.newDeps, this.deps)
  this.deps = this.newDeps
}

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */

p.update = function () {
  batcher.push(this)
}

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

p.run = function () {
  if (this.active) {
    var value = this.get()
    if (
      (typeof value === 'object' && value !== null) ||
      value !== this.value
    ) {
      var oldValue = this.value
      this.value = value
      var cbs = this.cbs
      var ctxs = this.ctxs
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i].call(ctxs[i], value, oldValue)
      }
    }
  }
}

/**
 * Add a callback.
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

p.addCb = function (cb, ctx) {
  this.cbs.push(cb)
  this.ctxs.push(ctx)
}

/**
 * Remove a callback.
 *
 * @param {Function} cb
 */

p.removeCb = function (cb) {
  var cbs = this.cbs
  if (cbs.length > 1) {
    var i = cbs.indexOf(cb)
    if (i > -1) {
      cbs.splice(i, 1)
      this.ctxs.splice(i, 1)
    }
  } else if (cb === cbs[0]) {
    this.teardown()
  }
}

/**
 * Remove self from all dependencies' subcriber list.
 */

p.teardown = function () {
  if (this.active) {
    this.active = false
    var vm = this.vm
    for (var path in this.deps) {
      vm._bindings[path]._removeSub(this)
    }
    this.vm = this.cbs = this.ctxs = null
  }
}

module.exports = Watcher