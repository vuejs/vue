import { Vue } from "./vue.d";
import { VNode, VNodeDirective } from "./vnode.d";

type Constructor = {
  new (...args: any[]): any;
}

export interface ComponentOptions {
  el?: Element | String;

  data?: Object | ( (this: Vue) => Object );
  props?: string[] | { [key: string]: PropOptions | Constructor | Constructor[] };
  propData?: Object;
  computed?: { [key: string]: ((this: Vue) => any) | ComputedOptions };
  methods?: { [key: string]: Function };
  watch?: { [key: string]: ({ handler: WatchHandler } & WatchOptions) | WatchHandler };
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

export interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

export interface WatchHandler {
  <T>(val: T, oldVal: T): void;
}

export interface DirectiveOptions {
  bind?: DirectiveFunction;
  update?: DirectiveFunction;
  componentUpdated?: DirectiveFunction;
  unbind?: DirectiveFunction;
}

export interface DirectiveFunction {
  (el: HTMLElement, binding: VNodeDirective, vnode: VNode, oldVnode: VNode): void;
}
