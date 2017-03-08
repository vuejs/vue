import { Vue, CreateElement, AnyVue } from "./vue";
import { VNode, VNodeData, VNodeDirective } from "./vnode";

type Constructor = {
  new (...args: any[]): any;
}

export type Component<Data = any, Methods = any, Computed = any> = typeof Vue | ComponentOptions<Data, Methods, Computed> | FunctionalComponentOptions;
export type AsyncComponent<Data = any, Methods = any, Computed = any> = (
  resolve: (component: Component<Data, Methods, Computed>) => void,
  reject: (reason?: any) => void
) => Promise<Component<Data, Methods, Computed>> | Component<Data, Methods, Computed> | void;

/**
 * When the `Computed` type parameter on `ComponentOptions` is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of `Accessors<Computed>` and work backwards.
 */
export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
}

export interface ComponentOptions<Data, Methods, Computed> {
  data?: Data | (() => Data);
  props?: string[] | { [key: string]: PropOptions | Constructor | Constructor[] };
  propsData?: Object;
  computed?: Accessors<Computed>;
  methods?: Methods;
  watch?: { [key: string]: ({ handler: WatchHandler<any> } & WatchOptions) | WatchHandler<any> | string };

  el?: Element | String;
  template?: string;
  render?(createElement: CreateElement): VNode;
  renderError?: (h: () => VNode, err: Error) => VNode;
  staticRenderFns?: ((createElement: CreateElement) => VNode)[];

  beforeCreate?(): void;
  created?(): void;
  beforeDestroy?(): void;
  destroyed?(): void;
  beforeMount?(): void;
  mounted?(): void;
  beforeUpdate?(): void;
  updated?(): void;
  activated?(): void;
  deactivated?(): void;

  directives?: { [key: string]: DirectiveOptions | DirectiveFunction };
  components?: { [key: string]: Component | AsyncComponent };
  transitions?: { [key: string]: Object };
  filters?: { [key: string]: Function };

  provide?: Object | (() => Object);
  inject?: { [key: string]: string | symbol } | Array<string>;

  model?: {
    prop?: string;
    event?: string;
  };

  parent?: AnyVue;
  mixins?: (ComponentOptions<any, any, any> | typeof Vue)[];
  name?: string;
  // TODO: support properly inferred 'extends'
  extends?: ComponentOptions<any, any, any> | typeof Vue;
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
  parent: AnyVue;
}

export interface PropOptions {
  type?: Constructor | Constructor[] | null;
  required?: boolean;
  default?: any;
  validator?(value: any): boolean;
}

export interface ComputedOptions<T> {
  get?(): T;
  set?(value: T): void;
  cache?: boolean;
}

export type WatchHandler<T> = (val: T, oldVal: T) => void;

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
