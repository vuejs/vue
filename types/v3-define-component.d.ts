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
import { CreateElement, RenderContext } from './umd'

export type DefineComponent<
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
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string
>(
  options: { functional?: never } & ComponentOptionsWithoutProps<
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
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string,
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions
>(
  options: { functional?: never } & ComponentOptionsWithArrayProps<
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
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Emits extends EmitsOptions = {},
  EmitsNames extends string = string,
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions
>(
  options: HasDefined<Props> extends true
    ? { functional?: never } & ComponentOptionsWithProps<
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
    : { functional?: never } & ComponentOptionsWithProps<
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

/**
 * overload 4.1: functional component with array props
 */
export function defineComponent<
  PropNames extends string,
  Props = Readonly<{ [key in PropNames]?: any }>
>(options: {
  functional: true
  props?: PropNames[]
  render?: (h: CreateElement, context: RenderContext<Props>) => any
}): DefineComponent<Props>

/**
 * overload 4.2: functional component with object props
 */
export function defineComponent<
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions,
  Props = ExtractPropTypes<PropsOptions>
>(options: {
  functional: true
  props?: PropsOptions
  render?: (h: CreateElement, context: RenderContext<Props>) => any
}): DefineComponent<PropsOptions>
