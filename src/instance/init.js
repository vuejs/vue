var Emitter = require('../emitter')
var mergeOptions = require('../util/merge-option')

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
  this.$root        = this.$root || this
  this._data        = options.data || {}
  this._rawContent  = null
  this._emitter     = new Emitter(this)
  this._watchers    = {}
  this._activeWatcher = null
  this._directives  = []

  // block instance properties
  this._isBlock     = false
  this._blockStart  = null
  this._blockEnd    = null

  // lifecycle state
  this._isCompiled  = false
  this._isDestroyed = false
  this._isReady     = false
  this._isAttached  = false

  // anonymous instances are created by flow-control
  // directives such as v-if and v-repeat
  this._isAnonymous = options.anonymous

  // merge options.
  this.$options = mergeOptions(
    this.constructor.options,
    options,
    this
  )

  // the `created` hook is called after basic properties
  // have been set up & before data observation happens.
  this._callHook('created')

  // initialize data observation and scope inheritance
  this._initScope()

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