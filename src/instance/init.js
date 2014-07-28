var _ = require('../util')

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
  this.$parent      = options.parent
  this._isBlock     = false
  this._isDestroyed = false 
  this._rawContent  = null

  // merge options.
  this.$options = _.mergeOptions(
    this.constructor.options,
    options,
    this
  )

  // create scope.
  // @creates this.$scope
  this._initScope()

  // setup initial data.
  // @creates this._data
  this._initData(options.data || {}, true)

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