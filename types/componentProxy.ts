import { ComponentInternalInstance, Data } from "./component";
import {
  ExtractComputedReturns,
  ComponentOptionsBase,
  ComputedOptions,
  MethodOptions,
  ComponentOptionsMixin,
  OptionTypesType,
  OptionTypesKeys,
} from "./componentOptions";
import { EmitsOptions, EmitFn } from "./componentEmits";
import { UnionToIntersection } from "./typeUtils";
import { VNode, WatchOptions } from "./umd";

// type nextTick  nextTick<T>(callback: (this: T) => void, context?: T): void;
// nextTick(): Promise<void>

/**
 * Custom properties added to component instances in any way and can be accessed through `this`
 *
 * @example
 * Here is an example of adding a property `$router` to every component instance:
 * ```ts
 * import { createApp } from 'vue'
 * import { Router, createRouter } from 'vue-router'
 *
 * declare module '@vue/runtime-core' {
 *   interface ComponentCustomProperties {
 *     $router: Router
 *   }
 * }
 *
 * // effectively adding the router to every component instance
 * const app = createApp({})
 * const router = createRouter()
 * app.config.globalProperties.$router = router
 *
 * const vm = app.mount('#app')
 * // we can access the router from the instance
 * vm.$router.push('/')
 * ```
 */
export interface ComponentCustomProperties {}

type IsDefaultMixinComponent<T> = T extends ComponentOptionsMixin
  ? ComponentOptionsMixin extends T
    ? true
    : false
  : false;

type MixinToOptionTypes<T> = T extends ComponentOptionsBase<
  infer P,
  infer D,
  infer C,
  infer M,
  infer Mixin,
  infer Extends,
  any
>
  ? OptionTypesType<P & {}, D & {}, C & {}, M & {}> &
      IntersectionMixin<Mixin> &
      IntersectionMixin<Extends>
  : never;

// ExtractMixin(map type) is used to resolve circularly references
type ExtractMixin<T> = {
  Mixin: MixinToOptionTypes<T>;
}[T extends ComponentOptionsMixin ? "Mixin" : never];

type IntersectionMixin<T> = IsDefaultMixinComponent<T> extends true
  ? OptionTypesType<{}, {}, {}, {}>
  : UnionToIntersection<ExtractMixin<T>>;

type UnwrapMixinsType<
  T,
  Type extends OptionTypesKeys
> = T extends OptionTypesType ? T[Type] : never;

type EnsureNonVoid<T> = T extends void ? {} : T;

export type CreateComponentPublicInstance<
  P = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = {},
  PublicProps = P,
  PublicMixin = IntersectionMixin<Mixin> & IntersectionMixin<Extends>,
  PublicP = UnwrapMixinsType<PublicMixin, "P"> & EnsureNonVoid<P>,
  PublicD = UnwrapMixinsType<PublicMixin, "D"> & EnsureNonVoid<D>,
  PublicC extends ComputedOptions = UnwrapMixinsType<PublicMixin, "C"> &
    EnsureNonVoid<C>,
  PublicM extends MethodOptions = UnwrapMixinsType<PublicMixin, "M"> &
    EnsureNonVoid<M>
> = ComponentPublicInstance<
  PublicP,
  PublicD,
  PublicC,
  PublicM,
  E,
  PublicProps,
  ComponentOptionsBase<P, D, C, M, Mixin, Extends, E>
>;
// public properties exposed on the proxy, which is used as the render context
// in templates (as `this` in the render option)
export type ComponentPublicInstance<
  P = {}, // props type extracted from props option
  D = {}, // return from data()
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  E extends EmitsOptions = {},
  PublicProps = P,
  Options = ComponentOptionsBase<any, any, any, any, any, any, any, any>
> = {
  $: ComponentInternalInstance;
  $data: D;
  $props: P & PublicProps;
  $attrs: Data;
  $refs: Data;
  readonly $slots: { [key: string]: VNode[] | undefined };
  $root: ComponentPublicInstance | null;
  $parent: ComponentPublicInstance | null;
  $emit: EmitFn<E>;
  $el: any;
  $options: Options;
  $forceUpdate(): void;
  nextTick<T>(callback: (this: T) => void, context?: T): void;
  nextTick(): Promise<void>;
  $watch: typeof instanceWatch;
} & P &
  D &
  ExtractComputedReturns<C> &
  M &
  ComponentCustomProperties;

export type ComponentPublicInstanceConstructor<
  T extends ComponentPublicInstance
> = {
  new (): T;
};

export type WatchStopHandle = () => void;

declare function instanceWatch(
  this: ComponentInternalInstance,
  source: string | Function,
  cb: Function,
  options?: WatchOptions
): WatchStopHandle;
