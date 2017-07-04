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
  readonly $refs: { [key: string]: Vue | Element | Vue[] | Element[]};
  readonly $slots: { [key: string]: VNode[] };
  readonly $scopedSlots: { [key: string]: ScopedSlot };
  readonly $isServer: boolean;
  readonly $ssrContext: any;
  readonly $props: any;

  $mount(elementOrSelector?: Element | String, hydrating?: boolean): this;
  $forceUpdate(): void;
  $destroy(): void;
  $set: typeof Vue.set;
  $delete: typeof Vue.delete;
  $watch(
    expOrFn: string,
    callback: WatchHandler<this, any>,
    options?: WatchOptions
  ): (() => void);
  $watch<T>(
    expOrFn: (this: this) => T,
    callback: WatchHandler<this, T>,
    options?: WatchOptions
  ): (() => void);
  $on(event: string | string[], callback: Function): this;
  $once(event: string, callback: Function): this;
  $off(event?: string | string[], callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
  $nextTick(callback: (this: this) => void): void;
  $nextTick(): Promise<void>;
  $createElement: CreateElement;

  static config: {
    silent: boolean;
    optionMergeStrategies: any;
    devtools: boolean;
    productionTip: boolean;
    performance: boolean;
    errorHandler(err: Error, vm: Vue, info: string): void;
    warnHandler(msg: string, vm: Vue, trace: string): void;
    ignoredElements: string[];
    keyCodes: { [key: string]: number };
  }

  static extend(options: ComponentOptions<Vue> | FunctionalComponentOptions): typeof Vue;
  static nextTick(callback: () => void, context?: any[]): void;
  static nextTick(): Promise<void>
  static set<T>(object: Object, key: string, value: T): T;
  static set<T>(array: T[], key: number, value: T): T;
  static delete(object: Object, key: string): void;
  static delete<T>(array: T[], key: number): void;

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
