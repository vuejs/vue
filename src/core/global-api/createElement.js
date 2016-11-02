/* @flow */

import { createElement } from '../vdom/create-element'

// Using the spread operator to avoid code duplication from the origin
export function initCreateElement (Vue: GlobalAPI) {
  Vue.createElement = function (...args): VNode | void {
    return createElement(...args)
  }
}
