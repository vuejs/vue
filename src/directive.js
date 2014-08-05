var _ = require('./util')
var Observer = require('./observe/observer')
var expParser = require('./parse/expression')
var Batcher = require('./batcher')

var batcher = new Batcher()
var uid = 0

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
 *                 - {String} expression
 *                 - {String} [arg]
 *                 - {Array<Object>} [filters]
 * @param {Object|Function} definition
 *                          - {Function} update
 *                          - {Function} [bind]
 *                          - {Function} [unbind]
 *                          - {Boolean} [literal]
 *                          - {Boolean} [twoway]
 *                          - {Array} [params]
 * @constructor
 */

function Directive (type, el, vm, descriptor, definition) {
  // public
  this.type = type
  this.el = el
  this.vm = vm
  this.value = undefined
  this.arg = descriptor.arg
  this.expression = descriptor.expression.trim()
  this.filters = descriptor.filters

  // private
  this._id = ++uid
  this._locked = false
  this._unbound = false
  this._deps = Object.create(null)
  this._newDeps = Object.create(null)

  // init definition
  this._initDef(definition)

  if (this.expression && !this.isLiteral) {
    // parse expression
    var res = expParser.parse(this.expression, this.twoway)
    this._getter = res.get
    this._setter = res.set
    // init dependencies
    this._initDeps(res.paths)
    // init filters
    this._initFilters()
    // init methods that need to be context-bound
    this._initBoundMethods()
    // update for the first time
    this._realUpdate(true)
  }
}

var p = Directive.prototype

/**
 * Initialize the directive instance's definition.
 */

p._initDef = function (definition) {
  _.extend(this, definition)
  // init params
  var el = this.el
  var attrs = this.paramAttributes
  if (attrs) {
    var params = this.params = {}
    attrs.forEach(function (p) {
      params[p] = el.getAttribute(p)
      el.removeAttribute(p)
    })
  }
  // call bind hook
  if (this.bind) {
    this.bind()
  }
}

/**
 * Initialize read and write filters
 */

p._initFilters = function () {
  if (!this.filters) {
    return
  }
  var self = this
  var vm = this.vm
  var registry = vm.$options.filters
  this.filters.forEach(function (f) {
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
      if (!self._readFilters) {
        self._readFilters = []
      }
      self._readFilters.push(function (value) {
        return args
          ? read.apply(vm, [value].concat(args))
          : read.call(vm, value)
      })
    }
    if (write) {
      if (!self._writeFilters) {
        self._writeFilters = []
      }
      self._writeFilters.push(function (value) {
        return args
          ? write.apply(vm, [value, self.value].concat(args))
          : write.call(vm, value, self.value)
      })
    }
  })
}

/**
 * Add root level path as a dependency.
 * this is specifically for the case where the expression
 * references a non-existing root level path, and later
 * that path is created with `vm.$add`.
 *
 * e.g. in "a && a.b", if `a` is not present at compilation,
 * the directive will end up with no dependency at all and
 * never gets updated.
 *
 * @param {Array} paths
 */

p._initDeps = function (paths) {
  var self = this
  paths.forEach(function (path) {
    self._addDep(path)
  })
  this._deps = this._newDeps
}

/**
 * Initialize a few methods that need to be context-bound
 * so we don't have to create them ad-hoc everytime
 */

p._initBoundMethods = function () {
  var self = this

  /**
   * Unlock function used in .set()
   */

  this._unlock = function () {
    self._locked = false
  }

  /**
   * real updater with bound context
   * to be pushed into batcher queue
   *
   * @param {Boolean} init
   */

  this._realUpdate = function (init) {
    if (self._unbound) {
      return
    }
    var value = self.get()
    if (
      (typeof value === 'object' && value !== null) ||
      value !== self.value ||
      init
    ) {
      self.value = value
      if (self.update) {
        self.update(value)
      }
    }
  }
}

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
  this._beforeGet()
  var value = this._getter.call(this.vm, this.vm.$scope)
  if (this._readFilters) {
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
    if (this._writeFilters) {
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
  batcher.push({
    id: this._id,
    execute: this._realUpdate
  })
}

/**
 * Apply filters to a value.
 *
 * @param {*} value
 * @param {Number} direction - -1 = read, 1 = write.
 */

p._applyFilters = function (value, direction) {
  var filters = direction > 0
    ? this._writeFilters
    : this._readFilters
  for (var i = 0, l = filters.length; i < l; i++) {
    value = filters[i](value)
  }
  return value
}

/**
 * Remove self from all dependencies' subcriber list.
 */

p._teardown = function () {
  if (this.unbind) this.unbind()
  this._unbound = true
  for (var p in this._deps) {
    this._deps[p]._removeSub(this)
  }
}

module.exports = Directive