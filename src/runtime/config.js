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
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: [
    'component',
    'directive',
    'transition'
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
    'ready',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed'
  ],

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100
}
