import { createElement } from '../core/vdom/create-element'
import VNode from 'core/vdom/vnode'
import { VNodeData, VNodeChildren } from 'typescript/vnode'
import { currentInstance } from './currentInstance'
import { warn } from 'core/util'

/**
 * @private this function needs manual type declaration because it relies
 * on previously manually authored types from Vue 2
 */
export function h(type: any, children?: VNodeChildren): VNode
export function h(
  type: any,
  props?: VNodeData | null,
  children?: VNodeChildren
): VNode

export function h(type: any, props?: any, children?: any) {
  if (!currentInstance) {
    __DEV__ &&
      warn(
        `globally imported h() can only be invoked when there is an active ` +
          `component instance, e.g. synchronously in a component's render or setup function.`
      )
  }
  return createElement(currentInstance!, type, props, children, 2, true)
}
