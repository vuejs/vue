import { Vue } from './vue';

type Constructor = {
  new (...args: any[]): any;
};

type Dictionary<T> = {
  [key: string]: T;
};

export type Component = ComponentOptions<Vue> | typeof Vue;
export type AsyncComponent = (
  resolve: (component: Component) => void,
  reject: (reason?: any) => void
) => Promise<Component> | Component | void;

export interface ComponentOptions<V extends Vue> {
  data?: Dictionary<any> | ((this: V) => Dictionary<any>);
  props?: string[] | Dictionary<PropOptions | Constructor | Constructor[]>;
  propsData?: Dictionary<any>;
  computed?: Dictionary<((this: V) => any) | ComputedOptions<V>>;
  methods?: Dictionary<(this: V, ...args: any[]) => any>;
  watch?: Dictionary<({ handler: WatchHandler<V> } & WatchOptions) | WatchHandler<V> | string>;

  el?: string | HTMLElement | (() => HTMLElement);
  template?: string;
  replace?: boolean;

  init?(this: V): void;
  created?(this: V): void;
  beforeCompile?(this: V): void;
  compiled?(this: V): void;
  activate?(this: V, done: () => void): void;
  ready?(this: V): void;
  attached?(this: V): void;
  detached?(this: V): void;
  beforeDestroy?(this: V): void;
  destroyed?(this: V): void;

  directives?: Dictionary<DirectiveOptions<V> | DirectiveFunction<V>>;
  elementDirectives?: Dictionary<DirectiveOptions<V> | Function>;
  filters?: Dictionary<Function | FilterOptions>;
  components?: Dictionary<Component | AsyncComponent>;
  transitions?: Dictionary<TransitionOptions>;
  partials?: Dictionary<string>;

  parent?: Vue;
  events?: Dictionary<((...args: any[]) => (boolean | void)) | string>;
  mixins?: (ComponentOptions<Vue> | typeof Vue)[];
  name?: string;
}

export interface PropOptions {
  type?: Constructor | Constructor[] | null;
  required?: boolean;
  default?: any;
  twoWay?: boolean;
  validator?(value: any): boolean;
  coerce?(value: any): any;
}

export interface ComputedOptions<V extends Vue> {
  get?(this: V): any;
  set(this: V, value: any): void;
}

export type WatchHandler<V> = (this: V, val: any, oldVal: any) => void;

export interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

export interface DirectiveInstance<V extends Vue> {
  el: HTMLElement;
  vm: V;
  expression: string;
  arg?: string;
  name: string;
  modifiers: Dictionary<boolean>;
  descriptor: any;
  params?: Dictionary<any>;
}

export type DirectiveFunction<V extends Vue> = (this: DirectiveInstance<V>, newVal: any, oldVal: any) => void;

export interface DirectiveOptions<V extends Vue> {
  bind?(this: DirectiveInstance<V>): void;
  update?(this: DirectiveInstance<V>, newVal: any, oldVal: any): void;
  unbind?(this: DirectiveInstance<V>): void;
  params?: string[];
  deep?: boolean;
  twoWay?: boolean;
  acceptStatement?: boolean;
  terminal?: boolean;
  priority?: number;
}

export interface FilterOptions {
  read?: Function;
  write?: Function;
}

export interface TransitionOptions {
  css?: boolean;
  animation?: string;
  enterClass?: string;
  leaveClass?: string;
  beforeEnter?(el: HTMLElement): void;
  enter?(el: HTMLElement, done: () => void): void;
  afterEnter?(el: HTMLElement): void;
  enterCancelled?(el: HTMLElement): void;
  beforeLeave?(el: HTMLElement): void;
  leave?(el: HTMLElement, done: () => void): void;
  afterLeave?(el: HTMLElement): void;
  leaveCancelled?(el: HTMLElement): void;
  stagger?(index: number): number;
  enterStagger?(index: number): number;
  leaveStagger?(index: number): number;
}
