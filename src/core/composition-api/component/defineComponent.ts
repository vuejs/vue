import { ComponentPropsOptions } from './componentProps'
import {
  MethodOptions,
  ComputedOptions,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithProps,
} from './componentOptions'
import { VueProxy } from './componentProxy'
import { Data } from './common'
import { HasDefined } from '../types/basic'

// overload 1: object format with no props
export function defineComponent<
  RawBindings,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {}
>(
  options: ComponentOptionsWithoutProps<unknown, RawBindings, D, C, M>
): VueProxy<unknown, RawBindings, D, C, M>

// overload 2: object format with array props declaration
// props inferred as { [key in PropNames]?: any }
// return type is for Vetur and TSX support
export function defineComponent<
  PropNames extends string,
  RawBindings = Data,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions
>(
  options: ComponentOptionsWithArrayProps<PropNames, RawBindings, D, C, M>
): VueProxy<Readonly<{ [key in PropNames]?: any }>, RawBindings, D, C, M>

// overload 3: object format with object props declaration
// see `ExtractPropTypes` in ./componentProps.ts
export function defineComponent<
  Props,
  RawBindings = Data,
  D = Data,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  PropsOptions extends ComponentPropsOptions = ComponentPropsOptions
>(
  options: HasDefined<Props> extends true
    ? ComponentOptionsWithProps<PropsOptions, RawBindings, D, C, M, Props>
    : ComponentOptionsWithProps<PropsOptions, RawBindings, D, C, M>
): VueProxy<PropsOptions, RawBindings, D, C, M>
// implementation, close to no-op
export function defineComponent(options: any) {
  return options as any
}
