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

  this.$el           = null
  this.$parent       = options._parent
  this.$root         = options._root || this
  this.$             = {}
  this._watcherList  = []
  this._watchers     = {}
  this._userWatchers = {}
  this._directives   = []

  // a flag to avoid this being observed
  this._isVue = true

  // events bookkeeping
  this._events         = {}
  this._eventsCount    = {}
  this._eventCancelled = false

  // block instance properties
  this._blockStart  =
  this._blockEnd    = null
  this._isBlock     = false

  // lifecycle state
  this._isCompiled  =
  this._isDestroyed =
  this._isReady     =
  this._isAttached  =
  this._isBeingDestroyed = false

  // children
  this._children =
  this._childCtors = null

  // anonymous instances are created by v-if
  this._isAnonymous = options._anonymous

  // merge options.
  options = this.$options = mergeOptions(
    this.constructor.options,
    options,
    this
  )

  // set data after merge.
  this._data = options.data || {}

  // setup event system and option events.
  this._initEvents()

  // initialize data observation and scope inheritance.
  this._initScope()

  // call created hook
  this._callHook('created')

  // if `el` option is passed, start compilation.
  if (options.el) {
    this.$mount(options.el)
  }
}