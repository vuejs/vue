import type { GlobalAPI } from 'types/global-api'
import { mergeOptions } from '../util/index'

/**
 * Initializes mixin functionality for Vue.js.
 *
 * @param {Object} Vue - The Vue instance with the global API.
 * @return {Object} - The modified Vue instance with mixin functionality.
 */

export function initMixin(Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
