import { Vue } from './vue'
import { VNode } from './vnode'
import { ComponentOptions as Vue2ComponentOptions } from './options'
import { EmitsOptions, SetupContext } from './v3-setup-context'
import { Data } from './common'
import { ComponentPropsOptions, ExtractPropTypes } from './v3-component-props'
import { CreateComponentPublicInstance } from './v3-component-public-instance'
export { ComponentPropsOptions } from './v3-component-props'

/**
 * Interface for declaring custom options.
 *
 * @example
 * ```ts
 * declare module 'vue' {
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

export type ComputedGetter<T> = (ctx?: any) => T
export type ComputedSetter<T> = (v: T) => void

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}

export type ComputedOptions = Record<
  string,
  ComputedGetter<any> | WritableComputedOptions<any>
>

export interface MethodOptions {
  [key: string]: Function
}

export type SetupFunction<
  Props,
  RawBindings = {},
  Emits extends EmitsOptions = {}
> = (
  this: void,
  props: Readonly<Props>,
  ctx: SetupContext<Emits>
) => RawBindings | (() => VNode | null) | void

export interface ComponentOptionsBase<
  Props,
  RawBindings,
  D,
  C extends ComputedOptions,
  M extends MethodOptions,
  Mixin extends ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin,
  Emits extends EmitsOptions,
  EmitNames extends string = string
> extends Omit<
      Vue2ComponentOptions<Vue, D, M, C, Props>,
      'data' | 'computed' | 'method' | 'setup' | 'props' | 'mixins' | 'extends'
    >,
    ComponentCustomOptions {
  // allow any custom options
  [key: string]: any

  // rewrite options api types
  data?: (
    this: CreateComponentPublicInstance<Props, {}, {}, {}, M, Mixin, Extends>,
    vm: CreateComponentPublicInstance<Props, {}, {}, {}, M, Mixin, Extends>
  ) => D
  computed?: C
  mixins?: Mixin[]
  extends?: Extends
  emits?: (Emits | EmitNames[]) & ThisType<void>
  setup?: SetupFunction<Props, RawBindings, Emits>
}

export type ComponentOptionsMixin = ComponentOptionsBase<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>

export type ExtractComputedReturns<T extends any> = {
  [key in keyof T]: T[key] extends { get: (...args: any[]) => infer TReturn }
    ? TReturn
    : T[key] extends (...args: any[]) => infer TReturn
    ? TReturn
    : never
}

export type ComponentOptionsWithProps<
  PropsOptions = ComponentPropsOptions,
  RawBindings = Data,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string,
  Props = ExtractPropTypes<PropsOptions>
> = ComponentOptionsBase<
  Props,
  RawBindings,
  D,
  C,
  M,
  Mixin,
  Extends,
  Emits,
  EmitsNames
> & {
  props?: PropsOptions
} & ThisType<
    CreateComponentPublicInstance<
      Props,
      RawBindings,
      D,
      C,
      M,
      Mixin,
      Extends,
      Emits
    >
  >

export type ComponentOptionsWithArrayProps<
  PropNames extends string = string,
  RawBindings = Data,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string,
  Props = Readonly<{ [key in PropNames]?: any }>
> = ComponentOptionsBase<
  Props,
  RawBindings,
  D,
  C,
  M,
  Mixin,
  Extends,
  Emits,
  EmitsNames
> & {
  props?: PropNames[]
} & ThisType<
    CreateComponentPublicInstance<
      Props,
      RawBindings,
      D,
      C,
      M,
      Mixin,
      Extends,
      Emits
    >
  >

export type ComponentOptionsWithoutProps<
  Props = {},
  RawBindings = Data,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string
> = ComponentOptionsBase<
  Props,
  RawBindings,
  D,
  C,
  M,
  Mixin,
  Extends,
  Emits,
  EmitsNames
> & {
  props?: undefined
} & ThisType<
    CreateComponentPublicInstance<
      Props,
      RawBindings,
      D,
      C,
      M,
      Mixin,
      Extends,
      Emits
    >
  >

export type WithLegacyAPI<T, D, C, M, Props> = T &
  Omit<Vue2ComponentOptions<Vue, D, M, C, Props>, keyof T>
