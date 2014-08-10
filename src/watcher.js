var _ = require('./util')
var Observer = require('./observe/observer')
var expParser = require('./parse/expression')
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
 * @param {Object} [ctx]
 * @param {Array} [filters]
 * @param {Boolean} [needSet]
 * @constructor
 */

function Watcher (vm, expression, cb, ctx, filters, needSet) {
  this.vm = vm
  this.expression = expression
  this.cb = cb // change callback
  this.ctx = ctx || vm // change callback context
  this.id = ++uid // uid for batching
  this.value = undefined
  this.active = true
  this.deps = Object.create(null)
  this.newDeps = Object.create(null)
  // setup filters if any.
  this.initFilters(filters)
  // parse expression for getter/setter
  var res = expParser.parse(expression, needSet)
  this.getter = res.get
  this.setter = res.set
  this.initDeps(res.paths)
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
 * @param {Array} paths
 */

p.initDeps = function (paths) {
  var i = paths.length
  while (i--) {
    this.addDep(paths[i])
  }
  this.value = this.get()
}

/**
 * Initialize read and write filters.
 * We delegate directive filters here to the watcher
 * because they need to be included in the dependency
 * collection process.
 *
 * @param {Array} filters
 */

p.initFilters = function (filters) {
  if (!filters) {
    return
  }
  var self = this
  var vm = this.vm
  var registry = vm.$options.filters
  filters.forEach(function (f) {
    var def = registry[f.name]
    var args = f.args
    var read, write
    if (typeof def === 'function') {
      read = def
    } else {
      read = def.read
      write = def.write
    }
    if (read) {
      if (!self.readFilters) {
        self.readFilters = []
      }
      self.readFilters.push(function (value) {
        return args
          ? read.apply(vm, [value].concat(args))
          : read.call(vm, value)
      })
    }
    if (write) {
      if (!self.writeFilters) {
        self.writeFilters = []
      }
      self.writeFilters.push(function (value) {
        return args
          ? write.apply(vm, [value, self.value].concat(args))
          : write.call(vm, value, self.value)
      })
    }
  })
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
        vm._getBindingAt(path) ||
        vm._createBindingAt(path)
      binding._addSub(this)
    }
  }
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

p.get = function () {
  this.beforeGet()
  var value = this.getter.call(this.vm, this.vm.$scope)
  if (this.readFilters) {
    value = applyFilters(value, this.readFilters)
  }
  this.afterGet()
  return value
}

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

p.set = function (value) {
  if (this.writeFilters) {
    value = applyFilters(value, this.writeFilters)
  }
  this.setter.call(this.vm, this.vm.$scope, value)
}

/**
 * Prepare for dependency collection.
 */

p.beforeGet = function () {
  Observer.emitGet = true
  this.vm._activeWatcher = this
  this.newDeps = Object.create(null)
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
      this.cb.call(this.ctx, value, oldValue)
    }
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
      vm._getBindingAt(path)._removeSub(this)
    }
  }
}

/**
 * Apply filters to a value
 *
 * @param {*} value
 * @param {Array} filters
 */

function applyFilters (value, filters) {
  for (var i = 0, l = filters.length; i < l; i++) {
    value = filters[i](value)
  }
  return value
}

module.exports = Watcher