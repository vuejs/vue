import { ExtractDefaultPropTypes, ExtractPropTypes } from './v3-component-props'
import {
  nextTick,
  ShallowUnwrapRef,
  UnwrapNestedRefs,
  WatchOptions,
  WatchStopHandle
} from './v3-generated'
import { Data } from './common'

import { Vue, VueConstructor } from './vue'
import { ComponentOptions as Vue2ComponentOptions } from './options'
import {
  ComputedOptions,
  MethodOptions,
  ExtractComputedReturns
} from './v3-component-options'
import {
  ComponentRenderEmitFn,
  EmitFn,
  EmitsOptions,
  ObjectEmitsOptions,
  Slots
} from './v3-setup-context'

type EmitsToProps<T extends EmitsOptions> = T extends string[]
  ? {
      [K in string & `on${Capitalize<T[number]>}`]?: (...args: any[]) => any
    }
  : T extends ObjectEmitsOptions
  ? {
      [K in string &
        `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}`
        ? T[Uncapitalize<C>] extends null
          ? (...args: any[]) => any
          : (
              ...args: T[Uncapitalize<C>] extends (...args: infer P) => any
                ? P
                : never
            ) => any
        : never
    }
  : {}

export type ComponentInstance = InstanceType<VueConstructor>

// public properties exposed on the proxy, which is used as the render context
// in templates (as `this` in the render option)
export type ComponentRenderProxy<
  P = {}, // props type extracted from props option
  B = {}, // raw bindings returned from setup()
  D = {}, // return from data()
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin = {},
  Extends = {},
  Emits extends EmitsOptions = {},
  PublicProps = P,
  Defaults = {},
  MakeDefaultsOptional extends boolean = false
> = {
  $data: D
  $props: Readonly<
    MakeDefaultsOptional extends true
      ? Partial<Defaults> & Omit<P & PublicProps, keyof Defaults>
      : P & PublicProps
  >
  $attrs: Record<string, string>
  $emit: ComponentRenderEmitFn<
    Emits,
    keyof Emits,
    ComponentRenderProxy<
      P,
      B,
      D,
      C,
      M,
      Mixin,
      Extends,
      Emits,
      PublicProps,
      Defaults,
      MakeDefaultsOptional
    >
  >
} & Readonly<P> &
  ShallowUnwrapRef<B> &
  D &
  M &
  ExtractComputedReturns<C> &
  Omit<Vue, '$data' | '$props' | '$attrs' | '$emit'>

// for Vetur and TSX support
type VueConstructorProxy<
  PropsOptions,
  RawBindings,
  Data,
  Computed extends ComputedOptions,
  Methods extends MethodOptions,
  Mixin = {},
  Extends = {},
  Emits extends EmitsOptions = {},
  Props = ExtractPropTypes<PropsOptions> &
    ({} extends Emits ? {} : EmitsToProps<Emits>)
> = Omit<VueConstructor, never> & {
  new (...args: any[]): ComponentRenderProxy<
    Props,
    ShallowUnwrapRef<RawBindings>,
    Data,
    Computed,
    Methods,
    Mixin,
    Extends,
    Emits,
    Props,
    ExtractDefaultPropTypes<PropsOptions>,
    true
  >
}

type DefaultData<V> = object | ((this: V) => object)
type DefaultMethods<V> = { [key: string]: (this: V, ...args: any[]) => any }
type DefaultComputed = { [key: string]: any }

export type VueProxy<
  PropsOptions,
  RawBindings,
  Data = DefaultData<Vue>,
  Computed extends ComputedOptions = DefaultComputed,
  Methods extends MethodOptions = DefaultMethods<Vue>,
  Mixin = {},
  Extends = {},
  Emits extends EmitsOptions = {}
> = Vue2ComponentOptions<
  Vue,
  ShallowUnwrapRef<RawBindings> & Data,
  Methods,
  Computed,
  PropsOptions,
  ExtractPropTypes<PropsOptions>
> &
  VueConstructorProxy<
    PropsOptions,
    RawBindings,
    Data,
    Computed,
    Methods,
    Mixin,
    Extends,
    Emits
  >

// public properties exposed on the proxy, which is used as the render context
// in templates (as `this` in the render option)
export type ComponentPublicInstance<
  P = {}, // props type extracted from props option
  B = {}, // raw bindings returned from setup()
  D = {}, // return from data()
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  E extends EmitsOptions = {},
  PublicProps = P,
  Defaults = {},
  MakeDefaultsOptional extends boolean = false
> = {
  $data: D
  $props: MakeDefaultsOptional extends true
    ? Partial<Defaults> & Omit<P & PublicProps, keyof Defaults>
    : P & PublicProps
  $attrs: Data
  $refs: Data
  $slots: Slots
  $root: ComponentPublicInstance | null
  $parent: ComponentPublicInstance | null
  $emit: EmitFn<E>
  $el: any
  // $options: Options & MergedComponentOptionsOverride
  $forceUpdate: () => void
  $nextTick: typeof nextTick
  $watch(
    source: string | Function,
    cb: Function,
    options?: WatchOptions
  ): WatchStopHandle
} & P &
  ShallowUnwrapRef<B> &
  UnwrapNestedRefs<D> &
  ExtractComputedReturns<C> &
  M
