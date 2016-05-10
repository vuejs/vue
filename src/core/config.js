export default {

  /**
   * Preserve whitespaces between elements.
   */
  preserveWhitespace: true,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */
  silent: false,

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: () => false,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: () => false,

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */
  _assetTypes: [
    'component',
    'directive',
    'transition',
    'filter'
  ],

  /**
   * List of lifecycle hooks.
   *
   * @type {Array}
   */
  _lifecycleHooks: [
    'init',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed'
  ],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   */
  _maxUpdateCount: 100,

  /**
   * Server rendering?
   */
  _isServer: process.env.VUE_ENV === 'server'
}
