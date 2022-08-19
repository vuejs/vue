import { Vue, CreateElement, CombinedVueInstance } from './vue'
import { VNode, VNodeData, VNodeDirective, NormalizedScopedSlot } from './vnode'
import { SetupContext } from './v3-setup-context'
import { DebuggerEvent } from './v3-generated'
import { DefineComponent } from './v3-define-component'
import { ComponentOptionsMixin } from './v3-component-options'

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
      V,
      Data,
      Methods,
      Computed,
      Readonly<Props>,
      SetupBindings,
      Mixin,
      Extends
    >
  >

type DefaultData<V> = object | ((this: V) => object)
type DefaultProps = Record<string, any>
type DefaultMethods<V> = { [key: string]: (this: V, ...args: any[]) => any }
type DefaultComputed = { [key: string]: any }

export interface ComponentOptions<
  V extends Vue,
  Data = DefaultData<V>,
  Methods = DefaultMethods<V>,
  Computed = DefaultComputed,
  PropsDef = PropsDefinition<DefaultProps>,
  Props = DefaultProps,
  RawBindings = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin
> {
  data?: Data
  props?: PropsDef
  propsData?: object
  computed?: Accessors<Computed>
  methods?: Methods
  watch?: Record<string, WatchOptionsWithHandler<any> | WatchHandler<any>>

  setup?: (
    this: void,
    props: Props,
    ctx: SetupContext
  ) => Promise<RawBindings> | RawBindings | ((h: CreateElement) => VNode) | void

  el?: Element | string
  template?: string
  // hack is for functional component type inference, should not be used in user code
  render?(
    createElement: CreateElement,
    hack: RenderContext<Props>
  ): VNode | null | void
  renderError?(createElement: CreateElement, err: Error): VNode
  staticRenderFns?: ((createElement: CreateElement) => VNode)[]

  beforeCreate?(this: V): void
  created?(): void
  beforeDestroy?(): void
  destroyed?(): void
  beforeMount?(): void
  mounted?(): void
  beforeUpdate?(): void
  updated?(): void
  activated?(): void
  deactivated?(): void
  errorCaptured?(err: Error, vm: Vue, info: string): boolean | void
  serverPrefetch?(this: V): Promise<void>
  renderTracked?(e: DebuggerEvent): void
  renderTriggerd?(e: DebuggerEvent): void

  directives?: { [key: string]: DirectiveFunction | DirectiveOptions }
  components?: {
    [key: string]:
      | {}
      | Component<any, any, any, any, any>
      | AsyncComponent<any, any, any, any>
  }
  transitions?: { [key: string]: object }
  filters?: { [key: string]: Function }

  provide?: object | (() => object)
  inject?: InjectOptions

  model?: {
    prop?: string
    event?: string
  }

  parent?: Vue
  mixins?: (Mixin | ComponentOptions<Vue> | typeof Vue)[]
  name?: string
  // for SFC auto name inference w/ ts-loader check
  __name?: string
  // TODO: support properly inferred 'extends'
  extends?: Extends | ComponentOptions<Vue> | typeof Vue
  delimiters?: [string, string]
  comments?: boolean
  inheritAttrs?: boolean
}

export interface FunctionalComponentOptions<
  Props = DefaultProps,
  PropDefs = PropsDefinition<Props>
> {
  name?: string
  props?: PropDefs
  model?: {
    prop?: string
    event?: string
  }
  inject?: InjectOptions
  functional: boolean
  render?(
    this: undefined,
    createElement: CreateElement,
    context: RenderContext<Props>
  ): VNode | VNode[]
}

export interface RenderContext<Props = DefaultProps> {
  props: Props
  children: VNode[]
  slots(): any
  data: VNodeData
  parent: Vue
  listeners: { [key: string]: Function | Function[] }
  scopedSlots: { [key: string]: NormalizedScopedSlot }
  injections: any
}

export type Prop<T> =
  | { (): T }
  | { new (...args: never[]): T & object }
  | { new (...args: string[]): Function }

export type PropType<T> = Prop<T> | Prop<T>[]

export type PropValidator<T> = PropOptions<T> | PropType<T>

export interface PropOptions<T = any> {
  type?: PropType<T>
  required?: boolean
  default?: T | null | undefined | (() => T | null | undefined)
  validator?(value: unknown): boolean
}

export type RecordPropsDefinition<T> = {
  [K in keyof T]: PropValidator<T[K]>
}
export type ArrayPropsDefinition<T> = (keyof T)[]
export type PropsDefinition<T> =
  | ArrayPropsDefinition<T>
  | RecordPropsDefinition<T>

export interface ComputedOptions<T> {
  get?(): T
  set?(value: T): void
  cache?: boolean
}

export type WatchHandler<T> = string | ((val: T, oldVal: T) => void)

export interface WatchOptions {
  deep?: boolean
  immediate?: boolean
}

export interface WatchOptionsWithHandler<T> extends WatchOptions {
  handler: WatchHandler<T>
}

export interface DirectiveBinding extends Readonly<VNodeDirective> {
  readonly modifiers: { [key: string]: boolean }
}

export type DirectiveFunction = (
  el: HTMLElement,
  binding: DirectiveBinding,
  vnode: VNode,
  oldVnode: VNode
) => void

export interface DirectiveOptions {
  bind?: DirectiveFunction
  inserted?: DirectiveFunction
  update?: DirectiveFunction
  componentUpdated?: DirectiveFunction
  unbind?: DirectiveFunction
}

export type InjectKey = string | symbol

export type InjectOptions =
  | {
      [key: string]: InjectKey | { from?: InjectKey; default?: any }
    }
  | string[]
