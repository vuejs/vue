import { ExtractDefaultPropTypes, ExtractPropTypes } from './componentProps'
import { ShallowUnwrapRef } from '..'
import { Data } from './common'

import Vue, {
  VueConstructor,
  ComponentOptions as Vue2ComponentOptions,
} from 'vue'
import {
  ComputedOptions,
  MethodOptions,
  ExtractComputedReturns,
} from './componentOptions'

export type ComponentInstance = InstanceType<VueConstructor>

// public properties exposed on the proxy, which is used as the render context
// in templates (as `this` in the render option)
export type ComponentRenderProxy<
  P = {}, // props type extracted from props option
  B = {}, // raw bindings returned from setup()
  D = {}, // return from data()
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
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
  $attrs: Data
} & Readonly<P> &
  ShallowUnwrapRef<B> &
  D &
  M &
  ExtractComputedReturns<C> &
  Omit<Vue, '$data' | '$props' | '$attrs'>

// for Vetur and TSX support
type VueConstructorProxy<
  PropsOptions,
  RawBindings,
  Data,
  Computed extends ComputedOptions,
  Methods extends MethodOptions
> = VueConstructor & {
  new (...args: any[]): ComponentRenderProxy<
    ExtractPropTypes<PropsOptions>,
    ShallowUnwrapRef<RawBindings>,
    Data,
    Computed,
    Methods,
    ExtractPropTypes<PropsOptions>,
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
  Methods extends MethodOptions = DefaultMethods<Vue>
> = Vue2ComponentOptions<
  Vue,
  ShallowUnwrapRef<RawBindings> & Data,
  Methods,
  Computed,
  PropsOptions,
  ExtractPropTypes<PropsOptions>
> &
  VueConstructorProxy<PropsOptions, RawBindings, Data, Computed, Methods>
