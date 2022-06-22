import { Vue } from './vue'
import { VNode } from './vnode'
import { ComponentOptions as Vue2ComponentOptions } from './options'
import { EmitsOptions, SetupContext } from './v3-setup-context'
import { Data } from './common'
import { ComponentPropsOptions, ExtractPropTypes } from './v3-component-props'
import { ComponentRenderProxy } from './v3-component-proxy'
export { ComponentPropsOptions } from './v3-component-props'

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

interface ComponentOptionsBase<
  Props,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {}
> extends Omit<
    Vue2ComponentOptions<Vue, D, M, C, Props>,
    'data' | 'computed' | 'method' | 'setup' | 'props'
  > {
  // allow any custom options
  [key: string]: any

  // rewrite options api types
  data?: (this: Props & Vue, vm: Props) => D
  computed?: C
  methods?: M
}

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
  Mixin = {},
  Extends = {},
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string,
  Props = ExtractPropTypes<PropsOptions>
> = ComponentOptionsBase<Props, D, C, M> & {
  props?: PropsOptions
  emits?: (Emits | EmitsNames[]) & ThisType<void>
  setup?: SetupFunction<Props, RawBindings, Emits>
} & ThisType<
    ComponentRenderProxy<Props, RawBindings, D, C, M, Mixin, Extends, Emits>
  >

export type ComponentOptionsWithArrayProps<
  PropNames extends string = string,
  RawBindings = Data,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin = {},
  Extends = {},
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string,
  Props = Readonly<{ [key in PropNames]?: any }>
> = ComponentOptionsBase<Props, D, C, M> & {
  props?: PropNames[]
  emits?: (Emits | EmitsNames[]) & ThisType<void>
  setup?: SetupFunction<Props, RawBindings, Emits>
} & ThisType<
    ComponentRenderProxy<Props, RawBindings, D, C, M, Mixin, Extends, Emits>
  >

export type ComponentOptionsWithoutProps<
  Props = {},
  RawBindings = Data,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin = {},
  Extends = {},
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string
> = ComponentOptionsBase<Props, D, C, M> & {
  props?: undefined
  emits?: (Emits | EmitsNames[]) & ThisType<void>
  setup?: SetupFunction<Props, RawBindings, Emits>
} & ThisType<
    ComponentRenderProxy<Props, RawBindings, D, C, M, Mixin, Extends, Emits>
  >

export type WithLegacyAPI<T, D, C, M, Props> = T &
  Omit<Vue2ComponentOptions<Vue, D, M, C, Props>, keyof T>
