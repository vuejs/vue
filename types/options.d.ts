import { Vue, CreateElement, CombinedVueInstance } from "./vue";
import { VNode, VNodeData, VNodeDirective } from "./vnode";

type Constructor = {
  new (...args: any[]): any;
}

export type Component<Data, Methods, Computed, PropNames extends string = never> =
  typeof Vue |
  FunctionalOrStandardComponentOptions<Data, Methods, Computed, PropNames>;

export type AsyncComponent<Data, Methods, Computed, PropNames extends string> = (
  resolve: (component: Component<Data, Methods, Computed, PropNames>) => void,
  reject: (reason?: any) => void
) => Promise<Component<Data, Methods, Computed, PropNames>> | Component<Data, Methods, Computed, PropNames> | void;

/**
 * When the `Computed` type parameter on `ComponentOptions` is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of `Accessors<Computed>` and work backwards.
 */
export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
}

/**
 * A general type that describes non-functional component options in Vue.
 *
 * While `ThisTypedComponentOptionsWithArrayProps` and `ThisTypedComponentOptionsWithRecordProps` will
 * lead to more accurate inferences, you can use this if the two are too cumbersome.
 */
export type ThisTypedComponentOptions<Data, Methods, Computed, PropNames extends string = never> =
  object &
  ComponentOptions<Data | ((this: Record<PropNames, any> & Vue) => Data), Methods, Computed, PropNames[] | Record<PropNames, PropOptions>> &
  ThisType<CombinedVueInstance<Data, Methods, Computed, Record<PropNames, any>>>;

/**
 * A specialized version of `ThisTypedComponentOptions`.
 * This type should be used when a parameter type only contains an array of strings for its `props` value.
 */
export type ThisTypedComponentOptionsWithArrayProps<Data, Methods, Computed, PropNames extends string> =
  object &
  ComponentOptions<Data | ((this: Record<PropNames, any> & Vue) => Data), Methods, Computed, PropNames[]> &
  ThisType<CombinedVueInstance<Data, Methods, Computed, Record<PropNames, any>>>;

/**
 * A specialized version of `ThisTypedComponentOptions`.
 * This type should be used when a parameter type only contains an object mapped to `PropOptions` for its `props` value.
 */
export type ThisTypedComponentOptionsWithRecordProps<Data, Methods, Computed, Props> =
  object &
  ComponentOptions<Data | ((this: Record<keyof Props, any> & Vue) => Data), Methods, Computed, Props> &
  ThisType<CombinedVueInstance<Data, Methods, Computed, Props>>;

/**
 * A helper type that describes options for either functional or non-functional components.
 * Useful for `Vue.extend` and `Vue.component`.
 */
export type FunctionalOrStandardComponentOptions<Data, Methods, Computed, PropNames extends string = never> =
  ThisTypedComponentOptions<Data, Methods, Computed, PropNames> |
  FunctionalComponentOptions<PropNames[] | Record<PropNames, PropValidator>, Record<PropNames, any>>;


export interface ComponentOptions<Data, Methods, Computed, Props> {
  data?: Data;
  props?: Props;
  propsData?: Object;
  computed?: Accessors<Computed>;
  methods?: Methods;
  watch?: Record<string, WatchOptionsWithHandler<any> | WatchHandler<any> | string>;

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

  directives?: { [key: string]: DirectiveFunction | DirectiveOptions };
  components?: { [key: string]: Component<any, any, any, never> | AsyncComponent<any, any, any, never> };
  transitions?: { [key: string]: Object };
  filters?: { [key: string]: Function };

  provide?: Object | (() => Object);
  inject?: { [key: string]: string | symbol } | Array<string>;

  model?: {
    prop?: string;
    event?: string;
  };

  parent?: Vue;
  mixins?: (ComponentOptions<any, any, any, any> | typeof Vue)[];
  name?: string;
  // TODO: support properly inferred 'extends'
  extends?: ComponentOptions<any, any, any, any> | typeof Vue;
  delimiters?: [string, string];
}

export interface FunctionalComponentOptions<Props = object, ContextProps = object> {
  props?: Props;
  functional: boolean;
  render(this: undefined, createElement: CreateElement, context: RenderContext<ContextProps>): VNode;
  name?: string;
}

export interface RenderContext<Props> {
  props: Props;
  children: VNode[];
  slots(): any;
  data: VNodeData;
  parent: Vue;
}

export type PropValidator = PropOptions | Constructor | Constructor[];

export interface PropOptions {
  type?: Constructor | Constructor[] | null;
  required?: boolean;
  default?: string | number | boolean | null | undefined | (() => object);
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

export interface WatchOptionsWithHandler<T> extends WatchOptions {
  handler: WatchHandler<T>;
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
