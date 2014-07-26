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

  /**
   * Expose instance options.
   * @type {Object}
   *
   * @public
   */

  this.$options = options || {}

  /**
   * Indicates whether this is a block instance. (One with more
   * than one top-level nodes)
   *
   * @type {Boolean}
   * @private
   */

  this._isBlock = false

  /**
   * Indicates whether the instance has been mounted to a DOM node.
   *
   * @type {Boolean}
   * @private
   */

  this._isMounted = false

  /**
   * Indicates whether the instance has been destroyed.
   *
   * @type {Boolean}
   * @private
   */

  this._isDestroyed = false

  /**
   * If the instance has a template option, the raw content it holds
   * before compilation will be preserved so they can be queried against
   * during content insertion.
   *
   * @type {DocumentFragment}
   * @private
   */

  this._rawContent = null

  // create scope.
  this._initScope()

  // setup initial data.
  this._initData(this.$options.data || {}, true)

  // setup property proxying
  this._initProxy()

  // setup binding tree.
  this._initBindings()
  
  // if `el` option is passed, start compilation.
  if (this.$options.el) {
    this.$mount(this.$options.el)
  }
}