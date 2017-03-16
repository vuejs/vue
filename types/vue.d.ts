import {
  Component,
  AsyncComponent,
  ComponentOptions,
  FunctionalComponentOptions,
  WatchOptions,
  WatchHandler,
  DirectiveOptions,
  DirectiveFunction,
  PropValidator,
  ThisTypedComponentOptionsWithArrayProps,
  ThisTypedComponentOptionsWithRecordProps,
  MyAsyncComponent,
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
  (tag: Component<any, any, any, any>, children: VNodeChildren): VNode;
  (tag: Component<any, any, any, any>, data?: VNodeData, children?: VNodeChildren): VNode;

  // async component
  (tag: AsyncComponent<any, any, any, any>, children: VNodeChildren): VNode;
  (tag: AsyncComponent<any, any, any, any>, data?: VNodeData, children?: VNodeChildren): VNode;
}

export interface AnyVue extends Vue<any, any, any, any> {}

export interface MinVue extends Vue<object, object, object, object> {}

export interface Vue<Data, Methods, Computed, Props> {
  $data: Data;
  readonly $el: HTMLElement;
  readonly $options: ComponentOptions<Data, Methods, Computed, Props>;
  readonly $parent: AnyVue;
  readonly $root: AnyVue;
  readonly $children: AnyVue[];
  readonly $refs: { [key: string]: AnyVue | Element | AnyVue[] | Element[] };
  readonly $slots: { [key: string]: VNode[] };
  readonly $scopedSlots: { [key: string]: ScopedSlot };
  readonly $isServer: boolean;
  readonly $props: Props;

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

export type CombinedVueInstance<Data, Methods, Computed, Props> = Data & Methods & Computed & Props & Vue<Data, Methods, Computed, Props>
export type ExtendedVue<Constructor extends VueConstructor, Data, Methods, Computed, Props> =
  (new (...args: any[]) => CombinedVueInstance<Data, Methods, Computed, Props>) &
  Constructor;

export interface VueConstructor {
  new <Data, Methods, Computed, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<Data, Methods, Computed, PropNames>): CombinedVueInstance<Data, Methods, Computed, Record<PropNames, any>>;
  new <Data, Methods, Computed, Props extends Record<string, PropValidator>>(options?: ThisTypedComponentOptionsWithRecordProps<Data, Methods, Computed, Props>): CombinedVueInstance<Data, Methods, Computed, Record<keyof Props, any>>;

  extend<VC extends VueConstructor, PropNames extends string = never>(this: VC, options: FunctionalComponentOptions<PropNames, Record<PropNames, any>>): ExtendedVue<VC, object, object, object, Record<PropNames, any>>;
  extend<VC extends VueConstructor, Data, Methods, Computed, PropNames extends string = never>(this: VC, options: ThisTypedComponentOptionsWithArrayProps<Data, Methods, Computed, PropNames>): ExtendedVue<VC, Data, Methods, Computed, Record<PropNames, any>>;
  extend<VC extends VueConstructor, Data, Methods, Computed, Props extends Record<string, PropValidator>>(this: VC, options?: ThisTypedComponentOptionsWithRecordProps<Data, Methods, Computed, Props>): ExtendedVue<VC, Data, Methods, Computed, Record<keyof Props, any>>;

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

  component(id: string): VueConstructor;
  component<VC extends VueConstructor>(id: string, constructor: VC): VC;
  component<VC extends VueConstructor, Data, Methods, Computed, PropNames extends string = never>(this: VC, id: string, definition: AsyncComponent<Data, Methods, Computed, PropNames>): ExtendedVue<VC, Data, Methods, Computed, Record<PropNames, any>>;
  component<VC extends VueConstructor, PropNames extends string = never>(this: VC, id: string, definition: FunctionalComponentOptions<PropNames, Record<PropNames, any>>): ExtendedVue<VC, {}, {}, {}, Record<PropNames, any>>;
  component<VC extends VueConstructor, Data, Methods, Computed, PropNames extends string = never>(this: VC, id: string, definition: ThisTypedComponentOptionsWithArrayProps<Data, Methods, Computed, PropNames>): ExtendedVue<VC, Data, Methods, Computed, Record<PropNames, any>>;
  component<VC extends VueConstructor, Data, Methods, Computed, Props extends Record<string, PropValidator>>(this: VC, id: string, definition?: ThisTypedComponentOptionsWithRecordProps<Data, Methods, Computed, Props>): ExtendedVue<VC, Data, Methods, Computed, Record<keyof Props, any>>;
  //component<VC extends VueConstructor, Data, Methods, Computed, PropNames extends string = never>(this: VC, id: string, definition: Component<Data, Methods, Computed, PropNames>): ExtendedVue<VC, Data, Methods, Computed, Record<PropNames, any>>;
  //component<Data, Methods, Computed, Props>(id: string, definition: Component<Data, Methods, Computed, Props> | AsyncComponent<Data, Methods, Computed, Props>): typeof Vue;

  use<T>(plugin: PluginObject<T> | PluginFunction<T>, options?: T): void;
  mixin(mixin: typeof Vue | ComponentOptions<any, any, any, any>): void;
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