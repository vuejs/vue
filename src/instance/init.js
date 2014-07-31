var Emitter = require('../emitter')
var mergeOptions = require('../util').mergeOptions

/**
 * The main init sequence. This is called for every instance,
 * including ones that are created from extended constructors.
 *
 * @param {Object} options - this options object should be the
 *                           result of merging class options
 *                           and the options passed in to the
 *                           constructor.
 */

exports._init = function (options) {

  options = options || {}

  this.$el          = null
  this._data        = options.data || {}
  this._isBlock     = false
  this._isDestroyed = false
  this._rawContent  = null
  this._emitter     = new Emitter(this)

  // setup parent relationship
  this.$parent = options.parent
  this._children = []
  if (this.$parent) {
    this.$parent._children.push(this)
  }

  // merge options.
  this.$options = mergeOptions(
    this.constructor.options,
    options,
    this
  )

  // the `created` hook is called after basic properties have
  // been set up & before data observation happens.
  this._callHook('created')

  // setup event system and option events
  this._initEvents()

  // create scope.
  // @creates this.$scope
  this._initScope()

  // setup initial data.
  this._initData(this._data, true)

  // setup computed properties
  this._initComputed()

  // setup instance methods
  this._initMethods()

  // setup property proxying
  this._initProxy()

  // setup binding tree.
  // @creates this._rootBinding
  this._initBindings()

  // if `el` option is passed, start compilation.
  if (options.el) {
    this.$mount(options.el)
  }
}