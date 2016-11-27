import {
  Component,
  AsyncComponent,
  ComponentOptions,
  FunctionalComponentOptions,
  WatchOptions,
  WatchHandler,
  DirectiveOptions,
  DirectiveFunction
} from "./options";
import { VNode, VNodeData, VNodeChildren, ScopedSlot } from "./vnode";
import { PluginFunction, PluginObject } from "./plugin";

export type CreateElement = {
  // empty node
  (): VNode;

  // element or component name
  (tag: string, children: VNodeChildren): VNode;
  (tag: string, data?: VNodeData, children?: VNodeChildren): VNode;

  // component constructor or options
  (tag: Component, children: VNodeChildren): VNode;
  (tag: Component, data?: VNodeData, children?: VNodeChildren): VNode;

  // async component
  (tag: AsyncComponent, children: VNodeChildren): VNode;
  (tag: AsyncComponent, data?: VNodeData, children?: VNodeChildren): VNode;
}

export declare class Vue {

  constructor(options?: ComponentOptions<Vue>);

  $data: Object;
  readonly $el: HTMLElement;
  readonly $options: ComponentOptions<this>;
  readonly $parent: Vue;
  readonly $root: Vue;
  readonly $children: Vue[];
  readonly $refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  readonly $slots: { [key: string]: VNode[] };
  readonly $scopedSlots: { [key: string]: ScopedSlot };
  readonly $isServer: boolean;

  $mount(elementOrSelector?: Element | String, hydrating?: boolean): this;
  $forceUpdate(): void;
  $destroy(): void;
  $set: typeof Vue.set;
  $delete: typeof Vue.delete;
  $watch(
    expOrFn: string | Function,
    callback: WatchHandler<this>,
    options?: WatchOptions
  ): (() => void);
  $on(event: string, callback: Function): this;
  $once(event: string, callback: Function): this;
  $off(event?: string, callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
  $nextTick(callback: (this: this) => void): void;
  $nextTick(): Promise<void>;
  $createElement: CreateElement;

  /** shorthands used in render functions */
  _h: CreateElement;

  /** toString for mustaches */
  _s(val: any): string;

  /** number conversion */
  _n(val: string): number | string;

  /** empty vnode */
  _e(): VNode;

  /** loose equal */
  _q(a: any, b: any): boolean;

  /** loose indexOf */
  _i(arr: any[], val: any): number;

  /** render static tree by index */
  _m(index: number, isInFor?: boolean): VNode | VNode[];

  /** mark node as static (v-once) */
  _o<T extends (VNode | VNode[])>(tree: T, index: number, key: string): T;

  /** filter resolution helper */
  _f(id: string): Function;

  /** render v-for */
  _l<T>(val: T[], render: (val: T, index: number) => VNode): VNode[];
  _l(val: number, render: (val: number, index: number) => VNode): VNode[];
  _l<T>(val: { [key: string]: T }, render: (val: T, key: string, index: number) => VNode): VNode[];

  /** renderSlot */
  _t(name: string, fallback?: VNode[], props?: { [key: string]: any }): VNode[] | null;

  /** apply v-bind object */
  _b(data: any, tag: string, value: any, asProp?: boolean): VNodeData;

  /** expose v-on keyCodes */
  _k(key: string): any;

  static config: {
    silent: boolean;
    optionMergeStrategies: any;
    devtools: boolean;
    errorHandler(err: Error, vm: Vue): void;
    keyCodes: { [key: string]: number };
  }

  static extend(options: ComponentOptions<Vue> | FunctionalComponentOptions): typeof Vue;
  static nextTick(callback: () => void, context?: any[]): void;
  static nextTick(): Promise<void>
  static set<T>(object: Object, key: string, value: T): T;
  static set<T>(array: T[], key: number, value: T): T;
  static delete(object: Object, key: string): void;

  static directive(
    id: string,
    definition?: DirectiveOptions | DirectiveFunction
  ): DirectiveOptions;
  static filter(id: string, definition?: Function): Function;
  static component(id: string, definition?: Component | AsyncComponent): typeof Vue;

  static use<T>(plugin: PluginObject<T> | PluginFunction<T>, options?: T): void;
  static mixin(mixin: typeof Vue | ComponentOptions<Vue>): void;
  static compile(template: string): {
    render(createElement: typeof Vue.prototype.$createElement): VNode;
    staticRenderFns: (() => VNode)[];
  };
}
