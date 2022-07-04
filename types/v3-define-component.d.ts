import { Component } from '..'
import {
  ComponentPropsOptions,
  ExtractDefaultPropTypes,
  ExtractPropTypes
} from './v3-component-props'
import {
  MethodOptions,
  ComputedOptions,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithProps,
  ComponentOptionsMixin,
  ComponentOptionsBase
} from './v3-component-options'
import {
  ComponentPublicInstanceConstructor,
  CreateComponentPublicInstance
} from './v3-component-public-instance'
import { Data, HasDefined } from './common'
import { EmitsOptions } from './v3-setup-context'

type DefineComponent<
  PropsOrPropOptions = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = ComputedOptions,
  M extends MethodOptions = MethodOptions,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = {},
  EE extends string = string,
  Props = Readonly<
    PropsOrPropOptions extends ComponentPropsOptions
      ? ExtractPropTypes<PropsOrPropOptions>
      : PropsOrPropOptions
  >,
  Defaults = ExtractDefaultPropTypes<PropsOrPropOptions>
> = ComponentPublicInstanceConstructor<
  CreateComponentPublicInstance<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    Props,
    Defaults,
    true
  > &
    Props
> &
  ComponentOptionsBase<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE,
    Defaults
  > & {
    props: PropsOrPropOptions
  }

/**
 * overload 1: object format with no props
 */
export function defineComponent<
  RawBindings,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string
>(
  options: ComponentOptionsWithoutProps<
    {},
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    Emits,
    EmitsNames
  >
): DefineComponent<{}, RawBindings, D, C, M, Mixin, Extends, Emits>

/**
 * overload 2: object format with array props declaration
 * props inferred as `{ [key in PropNames]?: any }`
 *
 * return type is for Vetur and TSX support
 */
export function defineComponent<
  PropNames extends string,
  RawBindings = Data,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string,
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions
>(
  options: ComponentOptionsWithArrayProps<
    PropNames,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    Emits,
    EmitsNames
  >
): DefineComponent<
  Readonly<{ [key in PropNames]?: any }>,
  RawBindings,
  D,
  C,
  M,
  Mixin,
  Extends,
  Emits
>

/**
 * overload 3: object format with object props declaration
 *
 * see `ExtractPropTypes` in './componentProps.ts'
 */
export function defineComponent<
  Props,
  RawBindings = Data,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string,
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions
>(
  options: HasDefined<Props> extends true
    ? ComponentOptionsWithProps<
        PropsOptions,
        RawBindings,
        D,
        C,
        M,
        Mixin,
        Extends,
        Emits,
        EmitsNames,
        Props
      >
    : ComponentOptionsWithProps<
        PropsOptions,
        RawBindings,
        D,
        C,
        M,
        Mixin,
        Extends,
        Emits,
        EmitsNames
      >
): DefineComponent<PropsOptions, RawBindings, D, C, M, Mixin, Extends, Emits>
