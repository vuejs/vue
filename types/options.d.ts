import { Vue, CreateElement, CombinedVueInstance } from './vue'
import { VNode, VNodeData, VNodeDirective, NormalizedScopedSlot } from './vnode'
import { SetupContext } from './v3-setup-context'
import { DebuggerEvent } from './v3-generated'
import { DefineComponent } from './v3-define-component'
import { ComponentOptionsMixin } from './v3-component-options'
import { ObjectDirective, FunctionDirective } from './v3-directive'

type Constructor = {
  new (...args: any[]): any
}

// we don't support infer props in async component
// N.B. ComponentOptions<V> is contravariant, the default generic should be bottom type
export type Component<
  Data = DefaultData<never>,
  Methods = DefaultMethods<never>,
  Computed = DefaultComputed,
  Props = DefaultProps,
  SetupBindings = {}
> =
  | typeof Vue
  | FunctionalComponentOptions<Props>
  | ComponentOptions<never, Data, Methods, Computed, Props, SetupBindings>
  | DefineComponent<any, any, any, any, any, any, any, any, any, any, any>

type EsModule<T> = T | { default: T }

type ImportedComponent<
  Data = DefaultData<never>,
  Methods = DefaultMethods<never>,
  Computed = DefaultComputed,
  Props = DefaultProps,
  SetupBindings = {}
> = EsModule<Component<Data, Methods, Computed, Props, SetupBindings>>

export type AsyncComponent<
  Data = DefaultData<never>,
  Methods = DefaultMethods<never>,
  Computed = DefaultComputed,
  Props = DefaultProps,
  SetupBindings = {}
> =
  | AsyncComponentPromise<Data, Methods, Computed, Props, SetupBindings>
  | AsyncComponentFactory<Data, Methods, Computed, Props, SetupBindings>

export type AsyncComponentPromise<
  Data = DefaultData<never>,
  Methods = DefaultMethods<never>,
  Computed = DefaultComputed,
  Props = DefaultProps,
  SetupBindings = {}
> = (
  resolve: (
    component: Component<Data, Methods, Computed, Props, SetupBindings>
  ) => void,
  reject: (reason?: any) => void
) => Promise<
  ImportedComponent<Data, Methods, Computed, Props, SetupBindings>
> | void

// Here is where the change for your issue is already correctly implemented
export type AsyncComponentFactory<
  Data = DefaultData<never>,
  Methods = DefaultMethods<never>,
  Computed = DefaultComputed,
  Props = DefaultProps,
  SetupBindings = {}
> = () => {
  component: Promise<
    ImportedComponent<Data, Methods, Computed, Props, SetupBindings>
  >
  loading?: ImportedComponent
  error?: ImportedComponent
  delay?: number
  timeout?: number
}

/**
 * When the `Computed` type parameter on `ComponentOptions` is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of `Accessors<Computed>` and work backwards.
 */
export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
}

type DataDef<Data, Props, V> = Data | ((this: Readonly<Props> & V) => Data)
/**
 * This type should be used when an array of strings is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithArrayProps<
  V extends Vue,
  Data,
  Methods,
  Computed,
  PropNames extends string,
  SetupBindings,
  Mixin extends ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin
> = object &
  ComponentOptions<
    V,
    DataDef<Data, Record<PropNames, any>, V>,
    Methods,
    Computed,
    PropNames[],
    Record<PropNames, any>,
    SetupBindings,
    Mixin,
    Extends
  > &
  ThisType<
    CombinedVueInstance<
      V,
      Data,
      Methods,
      Computed,
      Readonly<Record<PropNames, any>>,
      SetupBindings,
      Mixin,
      Extends
    >
  >

/**
 * This type should be used when an object mapped to `PropOptions` is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithRecordProps<
  V extends Vue,
  Data,
  Methods,
  Computed,
  Props,
  SetupBindings,
  Mixin extends ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin
> = object &
  ComponentOptions<
    V,
    DataDef<Data, Props, V>,
    Methods,
    Computed,
    RecordPropsDefinition<Props>,
    Props,
    SetupBindings,
    Mixin,
    Extends
  > &
  ThisType<
    CombinedVueInstance<
     
