/* @flow */

import type { Config } from '../config'
import type VNode from '../vdom/vnode'
import type Watcher from '../observer/watcher'

import { initProxy } from './proxy'
import { initState, stateMixin } from './state'
import { initRender, renderMixin } from './render'
import { initEvents, eventsMixin } from './events'
import { initLifecycle, lifecycleMixin, callHook } from './lifecycle'
import { mergeOptions } from '../util/index'

let uid = 0

export default class Vue {
  // static properties
  static cid: number;
  static options: Object;
  static config: Config;
  static util: Object;

  // static methods
  static set: (obj: Object, key: string, value: any) => void;
  static delete: (obj: Object, key: string) => void;
  static nextTick: (fn: Function, context?: Object) => void;
  static use: (plugin: Function | Object) => void;
  static mixin: (mixin: Object) => void;
  static extend: (options: Object) => Class<any>;
  static compile: (template: string) => { render: Function, staticRenderFns: Array<Function> };

  // assets
  static directive: (id: string, def?: Function | Object) => Function | Object | void;
  static component: (id: string, def?: Class<any> | Object) => Class<any>;
  static transition: (id: string, def?: Object) => Object | void;
  static filter: (id: string, def?: Function) => Function | void;

  // public properties
  $el: Element | void;
  $data: Object;
  $options: Object;
  $parent: Vue | void;
  $root: Vue;
  $children: Array<Vue>;
  $refs: { [key: string]: Vue | Element };
  $slots: { [key: string]: Array<VNode> };
  $isServer: boolean;

  // public methods
  $mount: (el?: Element | string) => Vue;
  $forceUpdate: () => void;
  $destroy: () => void;
  $watch: (expOrFn: string | Function, cb: Function, options?: Object) => Function;
  $on: (event: string, fn: Function) => Vue;
  $once: (event: string, fn: Function) => Vue;
  $off: (event?: string, fn?: Function) => Vue;
  $emit: (event: string, ...args: Array<any>) => Vue;
  $nextTick: (fn: Function) => void;
  $createElement: (
    tag?: string | Vue,
    data?: Object,
    children?: Array<?VNode> | string,
    namespace?: string
  ) => VNode;

  // private properties
  _uid: number;
  _isVue: true;
  _renderProxy: Vue;
  _watchers: Array<Watcher>;
  _data: Object;
  _events: { [key: string]: Array<Function> };
  _isMounted: boolean;
  _isDestroyed: boolean;
  _isBeingDestroyed: boolean;
  _vnode: ?VNode;
  _staticTrees: ?Array<VNode>;

  // private methods
  // lifecycle
  _mount: () => Vue;
  _update: (vnode: VNode) => void;
  _updateFromParent: (propsData?: Object, listeners?: Object, parentVnode: VNode, renderChildren: Array<VNode> | () => Array<VNode>) => void;
  // rendering
  _render: () => VNode;
  __h__: (
    tag?: string | Vue,
    data?: Object,
    children?: Array<?VNode> | string,
    namespace?: string
  ) => VNode;
  __toString__: (value: any) => string;
  __resolveFilter__: (id: string) => Function;
  __renderList__: (
    val: any,
    render: Function
  ) => ?Array<VNode>;
  __registerRef__: (
    key: string,
    ref: Vue | Element,
    vFor: boolean,
    isRemoval: boolean
  ) => void;

  constructor (options?: Object) {
    this._init(options)
  }

  _init (options?: Object) {
    // a uid
    this._uid = uid++
    // a flag to avoid this being observed
    this._isVue = true
    // merge options
    this.$options = mergeOptions(
      this.constructor.options,
      options || {},
      this
    )
    if (process.env.NODE_ENV !== 'production') {
      initProxy(this)
    } else {
      this._renderProxy = this
    }
    initLifecycle(this)
    initEvents(this)
    callHook(this, 'init')
    initState(this)
    callHook(this, 'created')
    initRender(this)
  }
}

stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
