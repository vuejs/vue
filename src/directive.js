var _ = require('./util')
var Watcher = require('./watcher')
var textParser = require('./parse/text')
var expParser = require('./parse/expression')

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {String} name
 * @param {Node} el
 * @param {Vue} vm
 * @param {Object} descriptor
 *                 - {String} expression
 *                 - {String} [arg]
 *                 - {Array<Object>} [filters]
 * @param {Object} def
 * @constructor
 */

function Directive (name, el, vm, descriptor, def) {
  // public
  this.name = name
  this.el = el
  this.vm = vm
  this.arg = descriptor.arg
  this.expression = descriptor.expression
  this.filters = descriptor.filters
  // private
  this._locked = false
  this._bound = false
  // init
  this._bind(def)
}

var p = Directive.prototype

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 *
 * @param {Object} def
 */

p._bind = function (def) {
  _.extend(this, def)
  this._watcherExp = this.expression
  this._checkDynamicLiteral()
  if (this.bind) {
    this.bind()
  }
  if (
    this.expression && this.update &&
    (!this.isLiteral || this._isDynamicLiteral)
  ) {
    if (!this._checkExpFn()) {
      this._watcher = new Watcher(
        this.vm,
        this._watcherExp,
        this._update, // callback
        this, // callback context
        this.filters,
        this.twoWay // need setter
      )
      this.update(this._watcher.value)
    }
  }
  this._bound = true
}

/**
 * check if this is a dynamic literal binding.
 *
 * e.g. v-component="{{currentView}}"
 */

p._checkDynamicLiteral = function () {
  var expression = this.expression
  if (expression && this.isLiteral) {
    var tokens = textParser.parse(expression)
    if (tokens) {
      if (tokens.length > 1) {
        _.warn(
          'Invalid literal directive: ' +
          this.name + '="' + expression + '"' +
          '\nDon\'t mix binding tags with plain text ' +
          'in literal directives.'
        )
      } else {
        var exp = tokens[0].value
        this.expression = this.vm.$get(exp)
        this._watcherExp = exp
        this._isDynamicLiteral = true
      }
    }
  }
}

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. v-on="click: a++"
 *
 * @return {Boolean}
 */

p._checkExpFn = function () {
  var expression = this.expression
  if (
    expression && this.isFn &&
    !expParser.pathTestRE.test(expression)
  ) {
    var fn = expParser.parse(expression).get
    var vm = this.vm
    this.update(function () {
      fn.call(vm, vm.$scope)
    })
    return true
  }
}

/**
 * Callback for the watcher.
 * Check locked or not before calling definition update.
 *
 * @param {*} value
 * @param {*} oldValue
 */

p._update = function (value, oldValue) {
  if (!this._locked) {
    this.update(value, oldValue)
  }
}

/**
 * Teardown the watcher and call unbind.
 */

p._teardown = function () {
  if (this._bound) {
    if (this.unbind) {
      this.unbind()
    }
    if (this._watcher) {
      this._watcher.teardown()
    }
    this._bound = false
  }
}

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @param {Boolean} lock - prevent wrtie triggering update.
 * @public
 */

p.set = function (value, lock) {
  if (this.twoWay) {
    if (lock) {
      this._locked = true
    }
    this._watcher.set(value)
    if (lock) {
      var self = this
      _.nextTick(function () {
        self._locked = false        
      })
    }
  }
}

module.exports = Directive