import { Vue, CreateElement } from "./vue";
import { VNode, VNodeData, VNodeDirective } from "./vnode";

type Constructor = {
  new (...args: any[]): any;
}

export type Component = typeof Vue | ComponentOptions<Vue> | FunctionalComponentOptions;
export type AsyncComponent = (
  resolve: (component: Component) => void,
  reject: (reason?: any) => void
) => Promise<Component> | Component | void;

export interface ComponentOptions<V extends Vue> {
  data?: Object | ((this: V) => Object);
  props?: string[] | { [key: string]: PropOptions | Constructor | Constructor[] };
  propsData?: Object;
  computed?: { [key: string]: ((this: V) => any) | ComputedOptions<V> };
  methods?: { [key: string]: (this: V, ...args: any[]) => any };
  watch?: { [key: string]: ({ handler: WatchHandler<V, any> } & WatchOptions) | WatchHandler<V, any> | string };

  el?: Element | String;
  template?: string;
  render?(this: V, createElement: CreateElement): VNode;
  renderError?: (h: () => VNode, err: Error) => VNode;
  staticRenderFns?: ((createElement: CreateElement) => VNode)[];

  beforeCreate?(this: V): void;
  created?(this: V): void;
  beforeDestroy?(this: V): void;
  destroyed?(this: V): void;
  beforeMount?(this: V): void;
  mounted?(this: V): void;
  beforeUpdate?(this: V): void;
  updated?(this: V): void;
  activated?(this: V): void;
  deactivated?(this: V): void;

  directives?: { [key: string]: DirectiveOptions | DirectiveFunction };
  components?: { [key: string]: Component | AsyncComponent };
  transitions?: { [key: string]: Object };
  filters?: { [key: string]: Function };

  provide?: Object | (() => Object);
  inject?: { [key: string]: string } | Array<string>;

  model?: {
    prop?: string;
    event?: string;
  };

  parent?: Vue;
  mixins?: (ComponentOptions<Vue> | typeof Vue)[];
  name?: string;
  extends?: ComponentOptions<Vue> | typeof Vue;
  delimiters?: [string, string];
}

export interface FunctionalComponentOptions {
  props?: string[] | { [key: string]: PropOptions | Constructor | Constructor[] };
  functional: boolean;
  render(this: never, createElement: CreateElement, context: RenderContext): VNode;
  name?: string;
}

export interface RenderContext {
  props: any;
  children: VNode[];
  slots(): any;
  data: VNodeData;
  parent: Vue;
}

export interface PropOptions {
  type?: Constructor | Constructor[] | null;
  required?: boolean;
  default?: any;
  validator?(value: any): boolean;
}

export interface ComputedOptions<V> {
  get?(this: V): any;
  set?(this: V, value: any): void;
  cache?: boolean;
}

export type WatchHandler<V, T> = (this: V, val: T, oldVal: T) => void;

export interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

export type DirectiveFunction = (
  el: HTMLElement,
  binding: VNodeDirective,
  vnode: VNode,
  oldVnode: VNode
) => void;

export interface DirectiveOptions {
  bind?: DirectiveFunction;
  inserted?: DirectiveFunction;
  update?: DirectiveFunction;
  componentUpdated?: DirectiveFunction;
  unbind?: DirectiveFunction;
}
