import type VNode from 'core/vdom/vnode'
import type Watcher from 'core/observer/watcher'
import { ComponentOptions } from './options'
import { SetupContext } from 'v3/apiSetup'
import { ScopedSlotsData, VNodeChildren, VNodeData } from './vnode'
import { GlobalAPI } from './global-api'
import { EffectScope } from 'v3/reactivity/effectScope'

// TODO this should be using the same as /component/

/**
 * @internal
 */
export declare class Component {
  constructor(options?: any)
  // constructor information
  static cid: number
  static options: Record<string, any>
  // extend
  static extend: GlobalAPI['extend']
  static superOptions: Record<string, any>
  static extendOptions: Record<string, any>
  static sealedOptions: Record<string, any>
  static super: typeof Component
  // assets
  static directive: GlobalAPI['directive']
  static component: GlobalAPI['component']
  static filter: GlobalAPI['filter']
  // functional context constructor
  static FunctionalRenderContext: Function
  static mixin: GlobalAPI['mixin']
  static use: GlobalAPI['use']

  // public properties
  $el: any // so that we can attach __vue__ to it
  $data: Record<string, any>
  $props: Record<string, any>
  $options: ComponentOptions
  $parent: Component | undefined
  $root: Component
  $children: Array<Component>
  $refs: {
    [key: string]: Component | Element | Array<Component | Element> | undefined
  }
  $slots: { [key: string]: Array<VNode> }
  $scopedSlots: { [key: string]: () => VNode[] | undefined }
  $vnode: VNode // the placeholder node for the component in parent's render tree
  $attrs: { [key: string]: string }
  $listeners: Record<string, Function | Array<Function>>
  $isServer: boolean

  // public methods
  $mount: (
    el?: Element | string,
    hydrating?: boolean
  ) => Component & { [key: string]: any }
  $forceUpdate: () => void
  $destroy: () => void
  $set: <T>(
    target: Record<string, any> | Array<T>,
    key: string | number,
    val: T
  ) => T
  $delete: <T>(
    target: Record<string, any> | Array<T>,
    key: string | number
  ) => void
  $watch: (
    expOrFn: string | (() => any),
    cb: Function,
    options?: Record<string, any>
  ) => Function
  $on: (event: string | Array<string>, fn: Function) => Component
  $once: (event: string, fn: Function) => Component
  $off: (event?: string | Array<string>, fn?: Function) => Component
  $emit: (event: string, ...args: Array<any>) => Component
  $nextTick: (fn: (...args: any[]) => any) => void | Promise<any>
  $createElement: (
    tag?: string | Component,
    data?: Record<string, any>,
    children?: VNodeChildren
  ) => VNode

  // private properties
  _uid: number | string
  _name: string // this only exists in dev mode
  _isVue: true
  __v_skip: true
  _self: Component
  _renderProxy: Component
  _renderContext?: Component
  _watcher: Watcher | null
  _scope: EffectScope
  _computedWatchers: { [key: string]: Watcher }
  _data: Record<string, any>
  _props: Record<string, any>
  _events: Record<string, any>
  _inactive: boolean | null
  _directInactive: boolean
  _isMounted: boolean
  _isDestroyed: boolean
  _isBeingDestroyed: boolean
  _vnode?: VNode | null // self root node
  _staticTrees?: Array<VNode> | null // v-once cached trees
  _hasHookEvent: boolean
  _provided: Record<string, any>
  // _virtualComponents?: { [key: string]: Component };

  // @v3
  _setupState?: Record<string, any>
  _setupProxy?: Record<string, any>
  _setupContext?: SetupContext
  _attrsProxy?: Record<string, any>
  _slotsProxy?: Record<string, () => VNode[]>
  _preWatchers?: Watcher[]

  // private methods

  // lifecycle
  _init: Function
  _mount: (el?: Element | void, hydrating?: boolean) => Component
  _update: (vnode: VNode, hydrating?: boolean) => void

  // rendering
  _render: () => VNode

  __patch__: (
    a: Element | VNode | void | null,
    b: VNode | null,
    hydrating?: boolean,
    removeOnly?: boolean,
    parentElm?: any,
    refElm?: any
  ) => any

  // createElement

  // _c is internal that accepts `normalizationType` optimization hint
  _c: (
    vnode?: VNode,
    data?: VNodeData,
    children?: VNodeChildren,
    normalizationType?: number
  ) => VNode | void

  // renderStatic
  _m: (index: number, isInFor?: boolean) => VNode | VNodeChildren
  // markOnce
  _o: (
    vnode: VNode | Array<VNode>,
    index: number,
    key: string
  ) => VNode | VNodeChildren
  // toString
  _s: (value: any) => string
  // text to VNode
  _v: (value: string | number) => VNode
  // toNumber
  _n: (value: string) => number | string
  // empty vnode
  _e: () => VNode
  // loose equal
  _q: (a: any, b: any) => boolean
  // loose indexOf
  _i: (arr: Array<any>, val: any) => number
  // resolveFilter
  _f: (id: string) => Function
  // renderList
  _l: (val: any, render: Function) => Array<VNode> | null
  // renderSlot
  _t: (
    name: string,
    fallback?: Array<VNode>,
    props?: Record<string, any>
  ) => Array<VNode> | null
  // apply v-bind object
  _b: (
    data: any,
    tag: string,
    value: any,
    asProp: boolean,
    isSync?: boolean
  ) => VNodeData
  // apply v-on object
  _g: (data: any, value: any) => VNodeData
  // check custom keyCode
  _k: (
    eventKeyCode: number,
    key: string,
    builtInAlias?: number | Array<number>,
    eventKeyName?: string
  ) => boolean | null
  // resolve scoped slots
  _u: (
    scopedSlots: ScopedSlotsData,
    res?: Record<string, any>
  ) => { [key: string]: Function }

  // SSR specific
  _ssrNode: Function
  _ssrList: Function
  _ssrEscape: Function
  _ssrAttr: Function
  _ssrAttrs: Function
  _ssrDOMProps: Function
  _ssrClass: Function
  _ssrStyle: Function

  // allow dynamic method registration
  // [key: string]: any
}
