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
  ComponentOptionsBase,
  AttrsType,
  noAttrsDefine,
  UnwrapAttrsType
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
  Attrs extends AttrsType = Record<string, unknown>,
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
    Attrs,
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
    Defaults,
    Attrs
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
  EmitsNames extends string = string,
  Attrs extends AttrsType = Record<string, unknown>
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
    EmitsNames,
    Attrs
  >
): DefineComponent<{}, RawBindings, D, C, M, Mixin, Extends, Emits, EmitsNames, Attrs>

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
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions,
  Attrs extends AttrsType = Record<string, unknown>
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
    EmitsNames,
    Attrs
  >
): DefineComponent<
  Readonly<{ [key in PropNames]?: any }>,
  RawBindings,
  D,
  C,
  M,
  Mixin,
  Extends,
  Emits,
  EmitsNames,
  Attrs
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
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions,
  Attrs extends AttrsType = Record<string, unknown>
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
        Attrs,
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
        EmitsNames,
        Attrs
      >
): DefineComponent<PropsOptions, RawBindings, D, C, M, Mixin, Extends, Emits, EmitsNames, Attrs>

/**
 * overload 4.1: functional component with array props
 */
export function defineComponent<
  PropNames extends string,
  Props = Readonly<{ [key in PropNames]?: any }>,
  Attrs extends AttrsType = Record<string, unknown>,
  // AttrsProps type used for JSX validation of attrs
  AttrsProps = noAttrsDefine<Attrs> extends true // if attrs is not defined
  ? {} // no JSX validation of attrs
  : Omit<UnwrapAttrsType<Attrs>, keyof Props> // exclude props from attrs, for JSX validation
>(options: {
  functional: true
  props?: PropNames[]
  attrs?: Attrs,
  render?: (h: CreateElement, context: RenderContext<Props, Attrs>) => any
}): DefineComponent<Props & AttrsProps>

/**
 * overload 4.2: functional component with object props
 */
export function defineComponent<
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions,
  Props = ExtractPropTypes<PropsOptions>,
  Attrs extends AttrsType = Record<string, unknown>,
  // AttrsProps type used for JSX validation of attrs
  AttrsProps = noAttrsDefine<Attrs> extends true // if attrs is not defined
  ? {} // no JSX validation of attrs
  : Omit<UnwrapAttrsType<Attrs>, keyof Props> // exclude props from attrs, for JSX validation
>(options: {
  functional: true
  props?: PropsOptions
  attrs?: Attrs,
  render?: (h: CreateElement, context: RenderContext<Props, Attrs>) => any
}): DefineComponent<Props & AttrsProps>
