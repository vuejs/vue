/* @flow */

const config: {
    preserveWhitespace: boolean,
    silent: boolean,
    isReservedTag: (x: string) => boolean,
    isUnknownElement: (x: string) => boolean,
    _assetTypes: Array<string>,
    _lifecycleHooks: Array<string>,
    _maxUpdateCount: number,
    _isServer: boolean
} = {

  /**
   * Preserve whitespaces between elements.
   */
  preserveWhitespace: true,

  /**
   * Whether to suppress warnings.
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
   */
  _assetTypes: [
    'component',
    'directive',
    'transition',
    'filter'
  ],

  /**
   * List of lifecycle hooks.
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

export default config
