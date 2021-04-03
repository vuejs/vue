import type { Config } from "../src/core/config";
import type VNode from "../src/core/vdom/vnode";
import type Watcher from "../src/core/observer/watcher";
import { ComponentOptions } from "./options";
import { ScopedSlotsData, VNodeChildren, VNodeData } from "./vnode";

declare class Component {
  // constructor information
  static cid: number;
  static options: Object;
  // extend
  static extend: (options: Object) => Function;
  static superOptions: Object;
  static extendOptions: Object;
  static sealedOptions: Object;
  static super: Component;
  // assets
  static directive: (
    id: string,
    def?: Function | Object
  ) => Function | Object | void;
  static component: (id: string, def?: Component | Object) => Component;
  static filter: (id: string, def?: Function) => Function | void;
  // functional context constructor
  static FunctionalRenderContext: Function;

  // public properties
  $el: any; // so that we can attach __vue__ to it
  $data: Object;
  $props: Object;
  $options: ComponentOptions;
  $parent: Component | undefined;
  $root: Component;
  $children: Array<Component>;
  $refs: {
    [key: string]: Component | Element | Array<Component | Element> | undefined;
  };
  $slots: { [key: string]: Array<VNode> };
  $scopedSlots: { [key: string]: () => VNodeChildren };
  $vnode: VNode; // the placeholder node for the component in parent's render tree
  $attrs: { [key: string]: string };
  $listeners: { [key: string]: Function | Array<Function> };
  $isServer: boolean;

  // public methods
  $mount: (el?: Element | string, hydrating?: boolean) => Component;
  $forceUpdate: () => void;
  $destroy: () => void;
  $set: <T>(target: Object | Array<T>, key: string | number, val: T) => T;
  $delete: <T>(target: Object | Array<T>, key: string | number) => void;
  $watch: (
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ) => Function;
  $on: (event: string | Array<string>, fn: Function) => Component;
  $once: (event: string, fn: Function) => Component;
  $off: (event?: string | Array<string>, fn?: Function) => Component;
  $emit: (event: string, ...args: Array<any>) => Component;
  $nextTick: (fn: Function) => void | Promise<any>;
  $createElement: (
    tag?: string | Component,
    data?: Object,
    children?: VNodeChildren
  ) => VNode;

  // private properties
  _uid: number | string;
  _name: string; // this only exists in dev mode
  _isVue: true;
  _self: Component;
  _renderProxy: Component;
  _renderContext?: Component;
  _watcher: Watcher;
  _watchers: Array<Watcher>;
  _computedWatchers: { [key: string]: Watcher };
  _data: Object;
  _props: Object;
  _events: Record<string, any>;
  _inactive: boolean | null;
  _directInactive: boolean;
  _isMounted: boolean;
  _isDestroyed: boolean;
  _isBeingDestroyed: boolean;
  _vnode?: VNode; // self root node
  _staticTrees?: Array<VNode>; // v-once cached trees
  _hasHookEvent: boolean;
  _provided?: Object;
  // _virtualComponents?: { [key: string]: Component };

  // private methods

  // lifecycle
  _init: Function;
  _mount: (el?: Element | void, hydrating?: boolean) => Component;
  _update: (vnode: VNode, hydrating?: boolean) => void;

  // rendering
  _render: () => VNode;

  __patch__: (
    a: Element | VNode | void,
    b: VNode | null,
    hydrating?: boolean,
    removeOnly?: boolean,
    parentElm?: any,
    refElm?: any
  ) => any;

  // createElement

  // _c is internal that accepts `normalizationType` optimization hint
  _c: (
    vnode?: VNode,
    data?: VNodeData,
    children?: VNodeChildren,
    normalizationType?: number
  ) => VNode | void;

  // renderStatic
  _m: (index: number, isInFor?: boolean) => VNode | VNodeChildren;
  // markOnce
  _o: (
    vnode: VNode | Array<VNode>,
    index: number,
    key: string
  ) => VNode | VNodeChildren;
  // toString
  _s: (value: any) => string;
  // text to VNode
  _v: (value: string | number) => VNode;
  // toNumber
  _n: (value: string) => number | string;
  // empty vnode
  _e: () => VNode;
  // loose equal
  _q: (a: any, b: any) => boolean;
  // loose indexOf
  _i: (arr: Array<any>, val: any) => number;
  // resolveFilter
  _f: (id: string) => Function;
  // renderList
  _l: (val: any, render: Function) => Array<VNode> | null;
  // renderSlot
  _t: (
    name: string,
    fallback?: Array<VNode>,
    props?: Object
  ) => Array<VNode> | null;
  // apply v-bind object
  _b: (
    data: any,
    tag: string,
    value: any,
    asProp: boolean,
    isSync?: boolean
  ) => VNodeData;
  // apply v-on object
  _g: (data: any, value: any) => VNodeData;
  // check custom keyCode
  _k: (
    eventKeyCode: number,
    key: string,
    builtInAlias?: number | Array<number>,
    eventKeyName?: string
  ) => boolean | null;
  // resolve scoped slots
  _u: (
    scopedSlots: ScopedSlotsData,
    res?: Object
  ) => { [key: string]: Function };

  // SSR specific
  _ssrNode: Function;
  _ssrList: Function;
  _ssrEscape: Function;
  _ssrAttr: Function;
  _ssrAttrs: Function;
  _ssrDOMProps: Function;
  _ssrClass: Function;
  _ssrStyle: Function;

  // allow dynamic method registration
  [key: string]: any;
}
