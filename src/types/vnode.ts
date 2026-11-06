import VNode from 'core/vdom/vnode'
import { Ref } from 'v3'
import { Component } from './component'
import { ASTModifiers } from './compiler'

/**
 * @internal
 */
export type VNodeChildren =
  | Array<null | VNode | string | number | VNodeChildren>
  | string

/**
 * @internal
 */
export type VNodeComponentOptions = {
  Ctor: typeof Component
  propsData?: Object
  listeners?: Record<string, Function | Function[]>
  children?: Array<VNode>
  tag?: string
}

/**
 * @internal
 */
export type MountedComponentVNode = VNode & {
  context: Component
  componentOptions: VNodeComponentOptions
  componentInstance: Component
  parent: VNode
  data: VNodeData
}

/**
 * @internal
 */
// interface for vnodes in update modules
export type VNodeWithData = VNode & {
  tag: string
  data: VNodeData
  children: Array<VNode>
  text: void
  elm: any
  ns: string | void
  context: Component
  key: string | number | undefined
  parent?: VNodeWithData
  componentOptions?: VNodeComponentOptions
  componentInstance?: Component
  isRootInsert: boolean
}

// // interface for vnodes in update modules
// export type VNodeWithData = {
//   tag: string;
//   data: VNodeData;
//   children: Array<VNode>;
//   text: void;
//   elm: any;
//   ns: string | void;
//   context: Component;
//   key: string | number | undefined;
//   parent?: VNodeWithData;
//   componentOptions?: VNodeComponentOptions;
//   componentInstance?: Component;
//   isRootInsert: boolean;
// };

/**
 * @internal
 */
export interface VNodeData {
  key?: string | number
  slot?: string
  ref?: string | Ref | ((el: any) => void)
  is?: string
  pre?: boolean
  tag?: string
  staticClass?: string
  class?: any
  staticStyle?: { [key: string]: any }
  style?: string | Array<Object> | Object
  normalizedStyle?: Object
  props?: { [key: string]: any }
  attrs?: { [key: string]: string }
  domProps?: { [key: string]: any }
  hook?: { [key: string]: Function }
  on?: { [key: string]: Function | Array<Function> }
  nativeOn?: { [key: string]: Function | Array<Function> }
  transition?: Object
  show?: boolean // marker for v-show
  inlineTemplate?: {
    render: Function
    staticRenderFns: Array<Function>
  }
  directives?: Array<VNodeDirective>
  keepAlive?: boolean
  scopedSlots?: { [key: string]: Function }
  model?: {
    value: any
    callback: Function
  }

  [key: string]: any
}

/**
 * @internal
 */
export type VNodeDirective = {
  name: string
  rawName: string
  value?: any
  oldValue?: any
  arg?: string
  oldArg?: string
  modifiers?: ASTModifiers
  def?: Object
}

/**
 * @internal
 */
export type ScopedSlotsData = Array<
  { key: string; fn: Function } | ScopedSlotsData
>
