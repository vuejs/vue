var _ = require('./util')
var Observer = require('./observe/observer')
var expParser = require('./parse/expression')
var Batcher = require('./batcher')

var batcher = new Batcher()
var uid = 0

/**
 * Only one watcher will be collecting dependency at
 * any time.
 */

var activeWatcher = null

/**
 * Collect dependency for the target directive being
 * evaluated. This is called on the active watcher's vm
 *
 * @param {String} path
 */

function collectDep (path) {
  activeWatcher.addDep(path)
}

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String} expression
 * @param {Function} cb
 * @param {Array} [filters]
 * @param {Boolean} [needSet]
 * @constructor
 */

function Watcher (vm, expression, cb, filters, needSet) {
  this.vm = vm
  this.expression = expression
  this.cbs = [cb]
  this.id = ++uid // uid for batching
  this.value = undefined
  this.active = true
  this.force = false
  this.deps = Object.create(null)
  this.newDeps = Object.create(null)
  // setup filters if any.
  // We delegate directive filters here to the watcher
  // because they need to be included in the dependency
  // collection process.
  this.readFilters = filters && filters.read
  this.writeFilters = filters && filters.write
  // parse expression for getter/setter
  var res = expParser.parse(expression, needSet)
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
        vm._createBindingAt(path)
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
  value = _.applyFilters(
    value, this.writeFilters, vm, this.value
  )
  this.setter.call(vm, vm, value)
}

/**
 * Prepare for dependency collection.
 */

p.beforeGet = function () {
  Observer.emitGet = true
  this.vm.$observer.on('get', collectDep)
  activeWatcher = this
  this.newDeps = {}
}

/**
 * Clean up for dependency collection.
 */

p.afterGet = function () {
  Observer.emitGet = false
  this.vm.$observer.off('get')
  activeWatcher = null
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
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i](value, oldValue)
      }
    }
  }
}

/**
 * Add a callback.
 *
 * @param {Function} cb
 */

p.addCb = function (cb) {
  this.cbs.push(cb)
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
    var vm = this.vm
    for (var path in this.deps) {
      vm._bindings[path]._removeSub(this)
    }
    this.active = false
    this.vm = this.cbs = this.value = null
  }
}

module.exports = Watcher