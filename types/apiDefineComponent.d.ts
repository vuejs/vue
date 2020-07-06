import {
  ComputedOptions,
  MethodOptions,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithObjectProps,
  ComponentOptionsMixin,
} from "./componentOptions";
import {
  CreateComponentPublicInstance,
  ComponentPublicInstanceConstructor,
} from "./componentProxy";
import { ExtractPropTypes, ComponentPropsOptions } from "./componentProps";
import { EmitsOptions } from "./componentEmits";
import { VNodeProps } from "./vnode";

// defineComponent is a utility that is primarily used for type inference
// when declaring components. Type inference is provided in the component
// options (provided as the argument). The returned value has artificial types
// for TSX / manual render function / IDE support.

// overload 1: direct setup function
// (uses user defined props interface)
// export function defineComponent<Props, RawBindings = object>(
//   setup: (
//     props: Readonly<Props>,
//     ctx: SetupContext
//   ) => RawBindings | RenderFunction
// ): ComponentPublicInstanceConstructor<
//   CreateComponentPublicInstance<
//     Props,
//     RawBindings,
//     {},
//     {},
//     {},
//     {},
//     {},
//     {},
//     // public props
//     VNodeProps & Props
//   >
// > &
//   FunctionalComponent<Props>;

// overload 2: object format with no props
// (uses user defined props interface)
// return type is for Vetur and TSX support
export function defineComponent<
  Props = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string
>(
  options: ComponentOptionsWithoutProps<
    Props,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): ComponentPublicInstanceConstructor<
  CreateComponentPublicInstance<
    Props,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    VNodeProps & Props
  >
> &
  ComponentOptionsWithoutProps<
    Props,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >;

// overload 3: object format with array props declaration
// props inferred as { [key in PropNames]?: any }
// return type is for Vetur and TSX support
export function defineComponent<
  PropNames extends string,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string
>(
  options: ComponentOptionsWithArrayProps<
    PropNames,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): ComponentPublicInstanceConstructor<
  // array props technically doesn't place any contraints on props in TSX before,
  // but now we can export array props in TSX
  CreateComponentPublicInstance<
    Readonly<{ [key in PropNames]?: any }>,
    D,
    C,
    M,
    Mixin,
    Extends,
    E
  >
> &
  ComponentOptionsWithArrayProps<
    PropNames,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >;

// overload 4: object format with object props declaration
// see `ExtractPropTypes` in ./componentProps.ts
export function defineComponent<
  // the Readonly constraint allows TS to treat the type of { required: true }
  // as constant instead of boolean.
  PropsOptions extends Readonly<ComponentPropsOptions>,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string
>(
  options: ComponentOptionsWithObjectProps<
    PropsOptions,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): ComponentPublicInstanceConstructor<
  CreateComponentPublicInstance<
    ExtractPropTypes<PropsOptions, false>,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    VNodeProps
  >
> &
  ComponentOptionsWithObjectProps<
    PropsOptions,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >;
