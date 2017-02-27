declare type $npm$Vue$Config = {
  silent: boolean;
  optionMergeStrategies: { [key: string]: Function };
  devtools: boolean;
  errorHandler: ?(err: Error, vm: Vue, info: string) => void;
  ignoredElements: Array<string>;
  keyCodes: { [key: string]: number | Array<number> };
}

declare type $npm$Vue$Constructor = Class<any>;

declare type $npm$Vue$Component = typeof Vue | $npm$Vue$FunctionalComponentOptions | $npm$Vue$ComponentOptions;

declare type $npm$Vue$AsyncComponent = (
  resolve: (component: $npm$Vue$Component) => void,
  reject: (reason?: any) => void
) => Promise<$npm$Vue$Component> | $npm$Vue$Component | void;

declare interface $npm$Vue$PropOptions {
  type?: $npm$Vue$Constructor | Array<$npm$Vue$Constructor>;
  required?: boolean;
  default?: any;
  validator?: (value: any) => boolean;
}

// TODO:
declare type $npm$Vue$CreateElement = {
  (): $npm$Vue$VNode;
  (tag: string, children: $npm$Vue$VNodeChildren): $npm$Vue$VNode;
  (tag: string, data?: $npm$Vue$VNodeData, children?: $npm$Vue$VNodeChildren): $npm$Vue$VNode;
  (tag: $npm$Vue$Component, children: $npm$Vue$VNodeChildren): $npm$Vue$VNode;
  (tag: $npm$Vue$Component, data?: $npm$Vue$VNodeData, children?: $npm$Vue$VNodeChildren): $npm$Vue$VNode;
  (tag: $npm$Vue$AsyncComponent, children: $npm$Vue$VNodeChildren): $npm$Vue$VNode;
  (tag: $npm$Vue$AsyncComponent, data?: $npm$Vue$VNodeData, children?: $npm$Vue$VNodeChildren): $npm$Vue$VNode;
}

declare type $npm$Vue$RenderContext = {
  props: any;
  children: Array<$npm$Vue$VNode>;
  slots(): any;
  data: $npm$Vue$VNodeData;
  parent: Vue;
}

declare interface $npm$Vue$ComputedOptions {
  get?: () => any;
  set?: (value: any) => void;
  cache?: boolean;
}

declare type $npm$Vue$WatchHandler = (val: any, oldVal: any) => void;

declare interface $npm$Vue$WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

declare type $npm$Vue$FunctionalComponentOptions = {
  props?: Array<string> | { [key: string]: $npm$Vue$PropOptions | $npm$Vue$Constructor | Array<$npm$Vue$Constructor> };
  functional: boolean;
  render: (createElement: $npm$Vue$CreateElement, context: $npm$Vue$RenderContext) => $npm$Vue$VNode;
  name?: string
}

declare type $npm$Vue$ComponentOptions = {
  // Options / Data
  data?: (() => Object) | Object;
  //data?: { $call?: () => Object };
  props?: Array<string> | { [key: string]: $npm$Vue$PropOptions | $npm$Vue$Constructor | Array<$npm$Vue$Constructor> };
  propsData?: Object;
  computed?: { [key: string]: (() => any) | $npm$Vue$ComputedOptions };
  methods?: { [key: string]: () => any };
  watch?: { [key: string]: ({ handler: $npm$Vue$WatchHandler } & $npm$Vue$WatchOptions) | $npm$Vue$WatchHandler | string };

  // Options /DOM
  el?: Element | string;
  template?: string;
  render?: (createElement: $npm$Vue$CreateElement) => $npm$Vue$VNode;
  //staticRenderFns?: (createElement: $npm$Vue$CreateElement) => Array<$npm$Vue$VNode>;

  // Options / Lifecycle
  beforeCreate?: Function;
  created?: Function;
  beforeDestroy?: Function;
  destroyed?: Function;
  beforeMount?: Function;
  mounted?: Function;
  beforeUpdate?: Function;
  updated?: Function;
  activated?: Function;
  deactivated?: Function;

  // Options / Assets
  directives?: { [key: string]: $npm$Vue$DirectiveOptions | $npm$Vue$DirectiveFunction };
  components?: { [key: string]: $npm$Vue$Component | $npm$Vue$AsyncComponent };
  //transitions?: { [key: string]: Object };
  filters?: { [key: string]: Function };

  // Options / Others
  parent?: Vue;
  mixins?: Array<$npm$Vue$ComponentOptions | typeof Vue>;
  name?: string;
  extends?: Array<$npm$Vue$ComponentOptions | typeof Vue>;
  delimiters?: [string, string];
  functional?: boolean;
}

declare type $npm$Vue$ScopedSlot = (props: any) => $npm$Vue$VNodeChildrenArrayContents | string;

declare interface $npm$Vue$VNodeComponentOptions {
  Ctor: typeof Vue;
  propsData?: Object;
  listeners?: Object;
  children?: $npm$Vue$VNodeChildren;
  tag?: string;
}

declare type $npm$Vue$VNodeChildren = $npm$Vue$VNodeChildrenArrayContents | [$npm$Vue$ScopedSlot] | string;

declare interface $npm$Vue$VNodeChildrenArrayContents {
  [x: number]: $npm$Vue$VNode | string | $npm$Vue$VNodeChildren;
}

declare interface $npm$Vue$VNodeData {
  key?: string | number;
  slot?: string;
  scopedSlots?: { [key: string]: $npm$Vue$ScopedSlot };
  ref?: string;
  tag?: string;
  staticClass?: string;
  class?: any;
  staticStyle?: { [key: string]: any };
  style?: Array<Object> | Object;
  props?: { [key: string]: any };
  attrs?: { [key: string]: any };
  domProps?: { [key: string]: any };
  hook?: { [key: string]: Function };
  on?: { [key: string]: Function | Array<Function> };
  nativeOn?: { [key: string]: Function | Array<Function> };
  transition?: Object;
  show?: boolean;
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Array<Function>;
  };
  directives?: Array<$npm$Vue$VNodeDirective>;
  keepAlive?: boolean;
}

declare interface $npm$Vue$VNode {
  tag?: string;
  data?: $npm$Vue$VNodeData;
  children?: Array<$npm$Vue$VNode>;
  text?: string;
  elm?: Node;
  ns?: string;
  context?: Vue;
  key?: string | number;
  componentOptions?: $npm$Vue$VNodeComponentOptions;
  componentInstance?: Vue;
  parent?: $npm$Vue$VNode;
  raw?: boolean;
  isStatic?: boolean;
  isRootInsert: boolean;
  isComment: boolean;
}

declare interface $npm$Vue$VNodeDirective {
  name: string;
  value: any;
  oldValue: any;
  expression: any;
  arg: string;
  modifiers: { [key: string]: boolean };
}

declare type $npm$Vue$DirectiveFunction = (
  el: HTMLElement,
  binding: $npm$Vue$VNodeDirective,
  vnode: $npm$Vue$VNode,
  oldVnode: $npm$Vue$VNode
) => void;

declare interface $npm$Vue$DirectiveOptions {
  bind?: $npm$Vue$DirectiveFunction;
  inserted?: $npm$Vue$DirectiveFunction;
  update?: $npm$Vue$DirectiveFunction;
  componentUpdated?: $npm$Vue$DirectiveFunction;
  unbind?: $npm$Vue$DirectiveFunction;
}

declare type $npm$Vue$PluginFunction = (Vue: typeof Vue, options?: Object) => void;

declare interface $npm$Vue$PluginObject {
  install: $npm$Vue$PluginFunction;
}

declare class Vue {
  constructor(options?: $npm$Vue$ComponentOptions): void;

  // Global Config
  static config: $npm$Vue$Config;

  // Global API
  static extend(options: $npm$Vue$FunctionalComponentOptions | $npm$Vue$ComponentOptions): typeof Vue;
  static nextTick(cb: Function, context?: Object): void;
  static nextTick(): Promise<void>;
  static set<T>(obj: Object | Array<T>, key: string, value: T): T;
  static delete(object: Object, key: string): void;
  static directive(id: string, definition?: $npm$Vue$DirectiveOptions | $npm$Vue$DirectiveFunction): $npm$Vue$DirectiveOptions;
  static filter(id: string, definition?: Function): Function;
  static component(id: string, definition?: $npm$Vue$Component | $npm$Vue$AsyncComponent): typeof Vue;

  static use(plugin: $npm$Vue$PluginObject | $npm$Vue$PluginFunction, options?: Object): void;
  static mixin(mixin: typeof Vue | $npm$Vue$ComponentOptions): void;
  static compile(template: string): {
    render(createElement: $npm$Vue$CreateElement): $npm$Vue$VNode;
    staticRenderFns: () => Array<$npm$Vue$VNode>;
  };
  static version: string;

  // Instance properties
  $data: Object;
  $el: HTMLElement;
  $options: $npm$Vue$ComponentOptions;
  $parent: Vue | void;
  $root: Vue;
  $children: Array<Vue>;
  $refs: { [key: string]: Vue | Element | Array<$Subtype<Vue>> | Array<$Subtype<Element>>};
  $slots: { [key: string]: Array<$npm$Vue$VNode> };
  $scopedSlots: { [key: string]: $npm$Vue$ScopedSlot };
  $isServer: boolean;

  // Instance Methods / Data
  $watch(
    expOrFn: string | Function,
    callback: $npm$Vue$WatchHandler,
    options?: $npm$Vue$WatchOptions
  ): (() => void);
  //$set<T>(obj: Object | Array<T>, key: string, value: T): T;
  $set: typeof Vue.set;
  //$delete (object: Object, key: string): void;
  $delete: typeof Vue.delete;

  // Instance methods / Event
  $on(event: string, callback: Function): this;
  $once(event: string, callback: Function): this;
  $off(event?: string, callback?: Function): this;
  $emit(event: string, ...args: Array<any>): this;

  // Instance methods / Lifecycle
  $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
  $forceUpdate(): void;
  $nextTick(callback: () => void): void;
  $nextTick(): Promise<void>;
  $destroy(): void;
}

declare module 'vue' {
  declare type Config = $npm$Vue$Config;

  declare type Component = $npm$Vue$Component;
  declare type AsyncComponent = $npm$Vue$AsyncComponent;

  declare type ComponentOptions = $npm$Vue$ComponentOptions;
  declare type FunctionalComponentOptions = $npm$Vue$FunctionalComponentOptions;
  declare type PropOptions = $npm$Vue$PropOptions;

  declare type ComputedOptions = $npm$Vue$ComputedOptions;

  declare type WatchHandler = $npm$Vue$WatchHandler;
  declare type WatchOptions = $npm$Vue$WatchOptions;

  declare type DirectiveFunction = $npm$Vue$DirectiveFunction;
  declare type DirectiveOptions = $npm$Vue$DirectiveOptions;

  declare type VNodeChildren = $npm$Vue$VNodeChildren;
  declare type VNodeChildrenArrayContents = $npm$Vue$VNodeChildrenArrayContents;
  declare type VNode = $npm$Vue$VNode;
  declare type VNodeComponentOptions = $npm$Vue$VNodeComponentOptions;
  declare type VNodeData = $npm$Vue$VNodeData;
  declare type VNodeDirective = $npm$Vue$VNodeDirective;
  declare type CreateElement = $npm$Vue$CreateElement;
  declare type RenderContext = $npm$Vue$RenderContext;

  declare module.exports: typeof Vue;
}

