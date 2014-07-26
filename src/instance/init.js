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
  // merge options.
  this.$options = _.mergeOptions(
    this.constructor.options,
    options
  )

  // create scope.
  // @creates this.$parent
  // @creates this.$scope
  this._initScope()

  // setup initial data.
  // @creates this._data
  this._initData(this.$options.data || {}, true)

  // setup property proxying
  this._initProxy()

  // setup binding tree.
  // @creates this._rootBinding
  this._initBindings()

  // compilation and lifecycle related state properties
  this.$el = null
  this._rawContent = null
  this._isBlock = false
  this._isMounted = false
  this._isDestroyed = false 

  // if `el` option is passed, start compilation.
  if (this.$options.el) {
    this.$mount(this.$options.el)
  }
}