var Emitter = require('../emitter')
var mergeOptions = require('../util').mergeOptions

/**
 * The main init sequence. This is called for every
 * instance, including ones that are created from extended
 * constructors.
 *
 * @param {Object} options - this options object should be
 *                           the result of merging class
 *                           options and the options passed
 *                           in to the constructor.
 */

exports._init = function (options) {

  options = options || {}

  this.$el          = null
  this.$            = {}
  this._data        = options.data || {}
  this._rawContent  = null
  this._emitter     = new Emitter(this)
  this._watchers    = {}
  this._activeWatcher = null
  this._directives  = []

  this._isBlock     = false
  this._blockStart  = null
  this._blockEnd    = null

  this._isCompiled  = false
  this._isDestroyed = false

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

  // the `created` hook is called after basic properties
  // have been set up & before data observation happens.
  this._callHook('created')

  // create scope.
  // @creates this.$scope
  this._initScope()

  // setup initial data.
  this._initData(this._data, true)

  // setup property proxying
  this._initProxy()

  // setup computed properties
  this._initComputed()

  // setup instance methods
  this._initMethods()

  // setup binding tree.
  // @creates this._rootBinding
  this._initBindings()

  // setup event system and option events
  this._initEvents()

  // if `el` option is passed, start compilation.
  if (options.el) {
    this.$mount(options.el)
  }
}