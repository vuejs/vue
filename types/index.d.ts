type Constructor = {
  new (...args: any[]): any;
}

declare class Vue {

  constructor(options?: Vue.ComponentOption);

  $data: Object;
  readonly $el: HTMLElement;
  readonly $options: Vue.ComponentOption;
  readonly $parent: Vue;
  readonly $root: Vue;
  readonly $chldren: Vue[];
  readonly $refs: {[key: string]: Vue};
  readonly $isServer: boolean;

  $watch(expOrFn: string | Function, callback: Vue.WatchHandler, options: Vue.WatchOption): (() => void);
  $set: typeof Vue.set;
  $delete: typeof Vue.delete;

  $on(event: string, callback: Function): this;
  $once(event: string, callback: Function): this;
  $off(event?: string, callback?: Function): this;
  $emit(event: string, ...args: any[]): this;

  $nextTick(callback?: (this: this) => void): void;

  $mount(elementOrSelector?: Element | String, hydrating?: boolean): this;
  $destroy(): void;


  static config: {
    silent: boolean;
    optionMergeStrategies: any;
    devtools: boolean;
    errorHandler(err: Error, vm: Vue): void;
    keyCodes: { [key: string]: number };
  }

  static extend(options: Vue.ComponentOption): Vue;
  static nextTick(callback: () => void, context?: any[]): void;
  static set<T>(object: Object, key: string, value: T): T;
  static delete(object: Object, key: string): void;
  static directive(id: string, definition?: Vue.DirectiveOption | Vue.DirectiveFunction): Vue.DirectiveOption;
  static filter(id: string, definition?: Function): Function;
  static component(id: string, definition?: typeof Vue | Vue.ComponentOption): typeof Vue;
  static use<T>(plugin: Vue.Plugin<T> | Vue.Installer<T>, options?: T): void;
  static mixin(mixin: typeof Vue | Vue.ComponentOption): void;
  static compile(template: string): {render: Function, staticRenderFns: Function};
}

declare namespace Vue {
  interface PropOption {
    type?: Constructor | Constructor[];
    required?: boolean;
    default?: any;
    validator?(value: any): boolean;
  }

  interface ComputedOption {
    get(this: Vue): any;
    set(this: Vue): void;
  }

  interface WatchOption {
    deep?: boolean;
    immediate?: boolean;
  }

  interface WatchHandler {
    <T>(val: T, oldVal: T): void;
  }

  interface ComponentOption {
    el?: Element | String;

    data?: Object | ( (this: Vue) => Object );
    props?: string[] | { [key: string]: PropOption | Constructor | Constructor[] };
    propData?: Object;
    computed?: { [key: string]: ((this: Vue) => any) | ComputedOption };
    methods?: { [key: string]: Function };
    watch?: { [key: string]: ({ handler: WatchHandler } & WatchOption) | WatchHandler };
    [key: string]: any;
  }

  interface DirectiveOption {
    bind?: DirectiveFunction;
    update?: DirectiveFunction;
    componentUpdated?: DirectiveFunction;
    unbind?: DirectiveFunction;
    [key: string]: any;
  }

  interface DirectiveFunction {
    (el: HTMLElement, binding: VNodeDirective, vnode: VNode, oldVnode: VNode): void;
  }

  interface VNodeDirective {
    name: string;
    value: any;
    oldValue: any;
    expression: any;
    arg: string;
    modifiers: {[key: string]: boolean};
  }

  interface VNode {
    //
  }

  interface Installer<T> {
    (Constructor: typeof Vue, options: T): void;
  }

  interface Plugin<T> {
    install: Installer<T>;
    [key: string]: any;
  }
}

export = Vue;
