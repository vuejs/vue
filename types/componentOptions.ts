import {
  ComponentInternalInstance,
  Data,
  ComponentInternalOptions,
  PublicAPIComponent,
  Component,
} from "./component";
// import { WatchOptions, WatchCallback } from "./apiWatch";
import {
  ComponentObjectPropsOptions,
  ExtractPropTypes,
} from "./componentProps";
import { EmitsOptions } from "./componentEmits";
// import { Directive } from './directives'
import {
  CreateComponentPublicInstance,
  ComponentPublicInstance,
} from "./componentProxy";
import { VNodeChild } from "./vnode";
import { Directive } from "./directives";

/**
 * Interface for declaring custom options.
 *
 * @example
 * ```ts
 * declare module '@vue/runtime-core' {
 *   interface ComponentCustomOptions {
 *     beforeRouteUpdate?(
 *       to: Route,
 *       from: Route,
 *       next: () => void
 *     ): void
 *   }
 * }
 * ```
 */
export interface ComponentCustomOptions {}

export type RenderFunction = () => VNodeChild;

export interface ComponentOptionsBase<
  Props,
  D,
  C extends ComputedOptions,
  M extends MethodOptions,
  Mixin extends ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin,
  E extends EmitsOptions,
  EE extends string = string
>
  extends LegacyOptions<Props, D, C, M, Mixin, Extends>,
    ComponentInternalOptions,
    ComponentCustomOptions {
  name?: string;
  template?: string | object; // can be a direct DOM node
  // Note: we are intentionally using the signature-less `Function` type here
  // since any type with signature will cause the whole inference to fail when
  // the return expression contains reference to `this`.
  // Luckily `render()` doesn't need any arguments nor does it care about return
  // type.
  render?: Function;
  components?: Record<string, PublicAPIComponent>;
  directives?: Record<string, Directive>;
  inheritAttrs?: boolean;
  emits?: E | EE[];

  // Internal ------------------------------------------------------------------

  /**
   * SSR only. This is produced by compiler-ssr and attached in compiler-sfc
   * not user facing, so the typing is lax and for test only.
   *
   * @internal
   */
  ssrRender?: (
    ctx: any,
    push: (item: any) => void,
    parentInstance: ComponentInternalInstance,
    attrs?: Data
  ) => void;

  /**
   * marker for AsyncComponentWrapper
   * @internal
   */
  __asyncLoader?: () => Promise<Component>;
  /**
   * cache for merged $options
   * @internal
   */
  __merged?: ComponentOptions;

  // Type differentiators ------------------------------------------------------

  // Note these are internal but need to be exposed in d.ts for type inference
  // to work!

  // type-only differentiator to separate OptionWithoutProps from a constructor
  // type returned by defineComponent() or FunctionalComponent
  call?: (this: unknown, ...args: unknown[]) => never;
  // type-only differentiators for built-in Vnode types
  __isFragment?: never;
  __isTeleport?: never;
  __isSuspense?: never;
}

export type ComponentOptionsWithoutProps<
  Props = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = EmitsOptions,
  EE extends string = string
> = ComponentOptionsBase<Props, D, C, M, Mixin, Extends, E, EE> & {
  props?: undefined;
} & ThisType<
    CreateComponentPublicInstance<
      {},
      D,
      C,
      M,
      Mixin,
      Extends,
      E,
      Readonly<Props>
    >
  >;

export type ComponentOptionsWithArrayProps<
  PropNames extends string = string,
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = EmitsOptions,
  EE extends string = string,
  Props = Readonly<{ [key in PropNames]?: any }>
> = ComponentOptionsBase<Props, D, C, M, Mixin, Extends, E, EE> & {
  props: PropNames[];
} & ThisType<CreateComponentPublicInstance<Props, D, C, M, Mixin, Extends, E>>;

export type ComponentOptionsWithObjectProps<
  PropsOptions = ComponentObjectPropsOptions,
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = EmitsOptions,
  EE extends string = string,
  Props = Readonly<ExtractPropTypes<PropsOptions>>
> = ComponentOptionsBase<Props, D, C, M, Mixin, Extends, E, EE> & {
  props: PropsOptions;
} & ThisType<CreateComponentPublicInstance<Props, D, C, M, Mixin, Extends, E>>;

export type ComponentOptions =
  | ComponentOptionsWithoutProps<any, any, any, any, any>
  | ComponentOptionsWithObjectProps<any, any, any, any, any>
  | ComponentOptionsWithArrayProps<any, any, any, any, any>;

export type ComponentOptionsMixin = ComponentOptionsBase<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

export type ComputedOptions = Record<
  string,
  ComputedGetter<any> | WritableComputedOptions<any>
>;

export type ComputedGetter<T> = (ctx?: any) => T;
export type ComputedSetter<T> = (v: T) => void;

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

export interface MethodOptions {
  [key: string]: Function;
}

export type ExtractComputedReturns<T extends any> = {
  [key in keyof T]: T[key] extends { get: (...args: any[]) => infer TReturn }
    ? TReturn
    : T[key] extends (...args: any[]) => infer TReturn
    ? TReturn
    : never;
};

export interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV
  // onInvalidate: InvalidateCbRegistrator
) => any;

type WatchOptionItem =
  | string
  | WatchCallback
  | ({ handler: WatchCallback } & WatchOptions);

type ComponentWatchOptionItem = WatchOptionItem | WatchOptionItem[];

type ComponentWatchOptions = Record<string, ComponentWatchOptionItem>;

type ComponentInjectOptions =
  | string[]
  | Record<
      string | symbol,
      string | symbol | { from: string | symbol; default?: unknown }
    >;

interface LegacyOptions<
  Props,
  D,
  C extends ComputedOptions,
  M extends MethodOptions,
  Mixin extends ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin
> {
  // allow any custom options
  [key: string]: any;

  // state
  // Limitation: we cannot expose RawBindings on the `this` context for data
  // since that leads to some sort of circular inference and breaks ThisType
  // for the entire component.
  data?: (
    this: CreateComponentPublicInstance<Props>,
    vm: CreateComponentPublicInstance<Props>
  ) => D;
  computed?: C;
  methods?: M;
  watch?: ComponentWatchOptions;
  provide?: Data | Function;
  inject?: ComponentInjectOptions;

  // composition
  mixins?: Mixin[];
  extends?: Extends;

  // lifecycle
  beforeCreate?(): void;
  created?(): void;
  beforeMount?(): void;
  mounted?(): void;
  beforeUpdate?(): void;
  updated?(): void;
  activated?(): void;
  deactivated?(): void;
  beforeUnmount?(): void;
  unmounted?(): void;
}

export type OptionTypesKeys = "P" | "D" | "C" | "M";

export type OptionTypesType<
  P = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {}
> = {
  P: P;
  D: D;
  C: C;
  M: M;
};

const enum OptionTypes {
  PROPS = "Props",
  DATA = "Data",
  COMPUTED = "Computed",
  METHODS = "Methods",
  INJECT = "Inject",
}

type DataFn = (vm: ComponentPublicInstance) => any;
