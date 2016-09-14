import type { Config } from '../src/core/config'
import type VNode from '../src/core/vdom/vnode'
import type Watcher from '../src/core/observer/watcher'

declare interface Component {
  // constructor information
  static cid: number;
  static options: Object;
  // extend
  static extend: (options: Object) => Function;
  static superOptions: Object;
  static extendOptions: Object;
  static super: Class<Component>;
  // assets
  static directive: (id: string, def?: Function | Object) => Function | Object | void;
  static component: (id: string, def?: Class<Component> | Object) => Class<Component>;
  static filter: (id: string, def?: Function) => Function | void;

  // public properties
  $el: any; // so that we can attach __vue__ to it
  $data: Object;
  $options: ComponentOptions;
  $parent: Component | void;
  $root: Component;
  $children: Array<Component>;
  $refs: { [key: string]: Component | Element | Array<Component | Element> | void };
  $slots: { [key: string]: Array<VNode> };
  $vnode: VNode;
  $isServer: boolean;

  // public methods
  $mount: (el?: Element | string, hydrating?: boolean) => Component;
  $forceUpdate: () => void;
  $destroy: () => void;
  $set: (obj: Array<any> | Object, key: any, val: any) => void;
  $delete: (obj: Object, key: string) => void;
  $watch: (expOrFn: string | Function, cb: Function, options?: Object) => Function;
  $on: (event: string, fn: Function) => Component;
  $once: (event: string, fn: Function) => Component;
  $off: (event?: string, fn?: Function) => Component;
  $emit: (event: string, ...args: Array<any>) => Component;
  $nextTick: (fn: Function) => void;
  $createElement: (
    tag?: string | Component,
    data?: Object,
    children?: VNodeChildren,
    namespace?: string
  ) => VNode;

  // private properties
  _uid: number;
  _isVue: true;
  _self: Component;
  _renderProxy: Component;
  _renderParent: ?Component;
  _watcher: Watcher;
  _watchers: Array<Watcher>;
  _data: Object;
  _events: Object;
  _inactive: boolean;
  _isMounted: boolean;
  _isDestroyed: boolean;
  _isBeingDestroyed: boolean;
  _vnode: ?VNode;
  _staticTrees: ?Array<VNode>;

  // private methods
  // lifecycle
  _init: Function;
  _mount: (el?: Element | void, hydrating?: boolean) => Component;
  _update: (vnode: VNode, hydrating?: boolean) => void;
  _updateListeners: (listeners: Object, oldListeners: ?Object) => void;
  _updateFromParent: (
    propsData: ?Object,
    listeners: ?{ [key: string]: Function | Array<Function> },
    parentVnode: VNode,
    renderChildren: ?VNodeChildren
  ) => void;
  // rendering
  _render: () => VNode;
  __patch__: (a: Element | VNode | void, b: VNode) => any;
  // createElement
  _h: (vnode?: VNode, data?: VNodeData, children?: VNodeChildren) => VNode | void;
  // renderStatic
  _m: (index: number, isInFor?: boolean) => VNode | VNodeChildren;
  // toString
  _s: (value: any) => string;
  // toNumber
  _n: (value: string) => number | string;
  // empty vnode
  _e: () => VNode;
  // resolveFilter
  _f: (id: string) => Function;
  // renderList
  _l: (val: any, render: Function) => ?Array<VNode>;
  // renderSlot
  _t: (name: string, fallback: ?Array<VNode>) => ?Array<VNode>;
  // apply v-bind object
  _b: (data: any, value: any, asProp?: boolean) => VNodeData;
  // retrive custom keyCode
  _k: (key: string) => ?number;

  // allow dynamic method registration
  [key: string]: any
}
