import { Vue } from "./vue.d";
import { VNode, VNodeData, VNodeDirective } from "./vnode.d";

type Constructor = {
  new (...args: any[]): any;
}

type $createElement = typeof Vue.prototype.$createElement;

export interface ComponentOptions {
  data?: Object | ( (this: Vue) => Object );
  props?: string[] | { [key: string]: PropOptions | Constructor | Constructor[] };
  propsData?: Object;
  computed?: { [key: string]: ((this: Vue) => any) | ComputedOptions };
  methods?: { [key: string]: Function };
  watch?: { [key: string]: ({ handler: WatchHandler } & WatchOptions) | WatchHandler | string };

  el?: Element | String;
  template?: string;
  render?(createElement: $createElement): VNode;
  staticRenderFns?: (() => VNode)[];

  beforeCreate?(): void;
  created?(): void;
  beforeDestroy?(): void;
  destroyed?(): void;
  beforeMount?(): void;
  mounted?(): void;
  beforeUpdate?(): void;
  updated?(): void;

  directives?: { [key: string]: DirectiveOptions | DirectiveFunction };
  components?: { [key: string]: ComponentOptions | FunctionalComponentOptions | typeof Vue };
  transitions?: { [key: string]: Object };
  filters?: { [key: string]: Function };

  parent?: Vue;
  mixins?: (ComponentOptions | typeof Vue)[];
  name?: string;
  extends?: ComponentOptions | typeof Vue;
  delimiters?: [string, string];
}

export interface FunctionalComponentOptions {
  props?: string[] | { [key: string]: PropOptions | Constructor | Constructor[] };
  functional: boolean;
  render(this: never, createElement: $createElement, context: RenderContext): VNode;
  name?: string;
}

export interface RenderContext {
  props: any;
  children: VNode[];
  slots: any;
  data: VNodeData;
  parent: Vue;
}

export interface PropOptions {
  type?: Constructor | Constructor[] | null;
  required?: boolean;
  default?: any;
  validator?(value: any): boolean;
}

export interface ComputedOptions {
  get?(this: Vue): any;
  set?(this: Vue, value: any): void;
  cache?: boolean;
}

export type WatchHandler = <T>(val: T, oldVal: T) => void;

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
  update?: DirectiveFunction;
  componentUpdated?: DirectiveFunction;
  unbind?: DirectiveFunction;
}
