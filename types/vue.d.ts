import {
  Component,
  AsyncComponent,
  ComponentOptions,
  FunctionalComponentOptions,
  WatchOptions,
  WatchHandler,
  DirectiveOptions,
  DirectiveFunction,
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

interface AnyVue extends Vue<any, any, any> {
}

export interface Vue<Data, Methods, Computed> {
  $data: Data;
  readonly $el: HTMLElement;
  readonly $options: ComponentOptions<Data, Methods, Computed>;
  readonly $parent: AnyVue;
  readonly $root: AnyVue;
  readonly $children: AnyVue[];
  readonly $refs: { [key: string]: AnyVue | Element | AnyVue[] | Element[] };
  readonly $slots: { [key: string]: VNode[] };
  readonly $scopedSlots: { [key: string]: ScopedSlot };
  readonly $isServer: boolean;
  readonly $props: any;

  $mount(elementOrSelector?: Element | String, hydrating?: boolean): this;
  $forceUpdate(): void;
  $destroy(): void;
  $set: typeof Vue.set;
  $delete: typeof Vue.delete;
  $watch(
    expOrFn: string,
    callback: WatchHandler<any>,
    options?: WatchOptions
  ): (() => void);
  $watch<T>(
    expOrFn: (this: this) => T,
    callback: WatchHandler<T>,
    options?: WatchOptions
  ): (() => void);
  $on(event: string | string[], callback: Function): this;
  $once(event: string, callback: Function): this;
  $off(event?: string, callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
  $nextTick(callback: (this: this) => void): void;
  $nextTick(): Promise<void>;
  $createElement: CreateElement;
}

export interface VueConstructor {
  new <Data, Methods, Computed>(options?: ComponentOptions<Data, Methods & ThisType<Data & Methods & Computed>, Computed> & ThisType<Data & Methods & Computed>): Data & Methods & Computed & Vue<Data, Methods, Computed>;

  extend<V, Data, Methods, Computed>(this: V, options: ComponentOptions<Data, Methods, Computed> | FunctionalComponentOptions): ((...args: any[]) => Vue<Data, Methods, Computed>) & V;
  nextTick(callback: () => void, context?: any[]): void;
  nextTick(): Promise<void>
  set<T>(object: Object, key: string, value: T): T;
  set<T>(array: T[], key: number, value: T): T;
  delete(object: Object, key: string): void;

  directive(
    id: string,
    definition?: DirectiveOptions | DirectiveFunction
  ): DirectiveOptions;
  filter(id: string, definition?: Function): Function;
  component(id: string, definition?: Component | AsyncComponent): typeof Vue;

  use<T>(plugin: PluginObject<T> | PluginFunction<T>, options?: T): void;
  mixin(mixin: typeof Vue | ComponentOptions<any, any, any>): void;
  compile(template: string): {
    render(createElement: typeof Vue.prototype.$createElement): VNode;
    staticRenderFns: (() => VNode)[];
  };

  config: {
    silent: boolean;
    optionMergeStrategies: any;
    devtools: boolean;
    productionTip: boolean;
    performance: boolean;
    errorHandler(err: Error, vm: AnyVue, info: string): void;
    ignoredElements: string[];
    keyCodes: { [key: string]: number };
  }
}

export const Vue: VueConstructor;