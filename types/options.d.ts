import { Vue } from "./vue.d";
import { VNode, VNodeDirective } from "./vnode.d";

type Constructor = {
  new (...args: any[]): any;
}

export interface ComponentOptions {
  data?: Object | ( (this: Vue) => Object );
  props?: string[] | { [key: string]: PropOptions | Constructor | Constructor[] };
  propData?: Object;
  computed?: { [key: string]: ((this: Vue) => any) | ComputedOptions };
  methods?: { [key: string]: Function };
  watch?: { [key: string]: ({ handler: WatchHandler } & WatchOptions) | WatchHandler };

  el?: Element | String;
  template?: string;
  render?(): VNode;
  staticRenderFns?(): (() => VNode)[];

  init?(): void;
  created?(): void;
  beforeMount?(): void;
  mounted?(): void;
  beforeUpdate?(): void;
  updated?(): void;

  directives?: { [key: string]: DirectiveOptions | DirectiveFunction };
  components?: { [key: string]: ComponentOptions | typeof Vue };
  transitions?: { [key: string]: Object };
  filters?: { [key: string]: Function };

  parent?: Vue;
  mixins?: (ComponentOptions | typeof Vue)[];
  name?: string;
  extends?: ComponentOptions | typeof Vue;
  delimiters?: [string, string];
}

export interface PropOptions {
  type?: Constructor | Constructor[] | null;
  required?: boolean;
  default?: any;
  validator?(value: any): boolean;
}

export interface ComputedOptions {
  get(this: Vue): any;
  set(this: Vue): void;
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
