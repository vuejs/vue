import { ComponentPropsOptions } from './v3-component-props'
import {
  MethodOptions,
  ComputedOptions,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithProps
} from './v3-component-options'
import { VueProxy } from './v3-component-proxy'
import { Data, HasDefined } from './common'
import { EmitsOptions } from './v3-setup-context'

/**
 * overload 1: object format with no props
 */
export function defineComponent<
  RawBindings,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin = {},
  Extends = {},
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
): VueProxy<{}, RawBindings, D, C, M, Mixin, Extends, Emits>
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
  Mixin = {},
  Extends = {},
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
): VueProxy<
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
  Mixin = {},
  Extends = {},
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
): VueProxy<PropsOptions, RawBindings, D, C, M, Mixin, Extends, Emits>
