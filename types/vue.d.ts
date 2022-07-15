import {
  Component,
  AsyncComponent,
  ComponentOptions,
  FunctionalComponentOptions,
  DirectiveOptions,
  DirectiveFunction,
  RecordPropsDefinition,
  ThisTypedComponentOptionsWithArrayProps,
  ThisTypedComponentOptionsWithRecordProps,
  WatchOptions
} from './options'
import { VNode, VNodeData, VNodeChildren, NormalizedScopedSlot } from './vnode'
import { PluginFunction, PluginObject } from './plugin'
import { DefineComponent } from './v3-define-component'
import { nextTick } from './v3-generated'
import { ComponentPublicInstance } from './v3-component-public-instance'

export interface CreateElement {
  (
    tag?:
      | string
      | Component<any, any, any, any>
      | AsyncComponent<any, any, any, any>
      | (() => Component),
    children?: VNodeChildren
  ): VNode
  (
    tag?:
      | string
      | Component<any, any, any, any>
      | AsyncComponent<any, any, any, any>
      | (() => Component),
    data?: VNodeData,
    children?: VNodeChildren
  ): VNode
}

type NeverFallback<T, D> = [T] extends [never] ? D : T

export interface Vue<
  Data = Record<string, any>,
  Props = Record<string, any>,
  Parent = never,
  Root = never,
  Children = never,
  Options = never,
  Emit = (event: string, ...args: any[]) => Vue
> {
  // properties with different types in defineComponent()
  readonly $data: Data
  readonly $props: Props
  readonly $parent: NeverFallback<Parent, Vue>
  readonly $root: NeverFallback<Root, Vue>
  readonly $children: NeverFallback<Children, Vue[]>
  readonly $options: NeverFallback<Options, ComponentOptions<Vue>>
  $emit: Emit

  // Vue 2 only or shared
  readonly $el: Element
  readonly $refs: {
    [key: string]:
      | Vue
      | Element
      | ComponentPublicInstance
      | (Vue | Element | ComponentPublicInstance)[]
      | undefined
  }
  readonly $slots: { [key: string]: VNode[] | undefined }
  readonly $scopedSlots: { [key: string]: NormalizedScopedSlot | undefined }
  readonly $isServer: boolean

  readonly $ssrContext: any
  readonly $vnode: VNode
  readonly $attrs: Record<string, string>
  readonly $listeners: Record<string, Function | Function[]>

  $mount(elementOrSelector?: Element | string, hydrating?: boolean): this
  $forceUpdate(): void
  $destroy(): void
  $set: typeof Vue.set
  $delete: typeof Vue.delete
  $watch(
    expOrFn: string,
    callback: (this: this, n: any, o: any) => void,
    options?: WatchOptions
  ): () => void
  $watch<T>(
    expOrFn: (this: this) => T,
    callback: (this: this, n: T, o: T) => void,
    options?: WatchOptions
  ): () => void
  $on(event: string | string[], callback: Function): this
  $once(event: string | string[], callback: Function): this
  $off(event?: string | string[], callback?: Function): this
  $nextTick: typeof nextTick
  $createElement: CreateElement
}

export type CombinedVueInstance<
  Instance extends Vue,
  Data,
  Methods,
  Computed,
  Props,
  SetupBindings
> = Data &
  Methods &
  Computed &
  Props &
  Instance &
  (SetupBindings extends void ? {} : SetupBindings)

export type ExtendedVue<
  Instance extends Vue,
  Data,
  Methods,
  Computed,
  Props,
  SetupBindings
> = VueConstructor<
  CombinedVueInstance<Instance, Data, Methods, Computed, Props, SetupBindings> &
    Vue
>

export interface VueConfiguration {
  silent: boolean
  optionMergeStrategies: any
  devtools: boolean
  productionTip: boolean
  performance: boolean
  errorHandler(err: Error, vm: Vue, info: string): void
  warnHandler(msg: string, vm: Vue, trace: string): void
  ignoredElements: (string | RegExp)[]
  keyCodes: { [key: string]: number | number[] }
  async: boolean
}

export interface VueConstructor<V extends Vue = Vue> {
  /**
   * new with array props
   */
  new <
    Data = object,
    Methods = object,
    Computed = object,
    PropNames extends string = never,
    SetupBindings = {}
  >(
    options?: ThisTypedComponentOptionsWithArrayProps<
      V,
      Data,
      Methods,
      Computed,
      PropNames,
      SetupBindings
    >
  ): CombinedVueInstance<
    V,
    Data,
    Methods,
    Computed,
    Record<PropNames, any>,
    SetupBindings
  >

  /**
   * new with object props
   * ideally, the return type should just contain Props,
   * not Record<keyof Props, any>. But TS requires to have Base constructors
   * with the same return type.
   */
  new <
    Data = object,
    Methods = object,
    Computed = object,
    Props = object,
    SetupBindings = {}
  >(
    options?: ThisTypedComponentOptionsWithRecordProps<
      V,
      Data,
      Methods,
      Computed,
      Props,
      SetupBindings
    >
  ): CombinedVueInstance<
    V,
    Data,
    Methods,
    Computed,
    Record<keyof Props, any>,
    SetupBindings
  >

  /**
   * new with no props
   */
  new (options?: ComponentOptions<V>): CombinedVueInstance<
    V,
    object,
    object,
    object,
    Record<keyof object, any>,
    {}
  >

  /**
   * extend with array props
   */
  extend<
    Data,
    Methods,
    Computed,
    PropNames extends string = never,
    SetupBindings = {}
  >(
    options?: ThisTypedComponentOptionsWithArrayProps<
      V,
      Data,
      Methods,
      Computed,
      PropNames,
      SetupBindings
    >
  ): ExtendedVue<
    V,
    Data,
    Methods,
    Computed,
    Record<PropNames, any>,
    SetupBindings
  >

  /**
   * extend with object props
   */
  extend<Data, Methods, Computed, Props, SetupBindings = {}>(
    options?: ThisTypedComponentOptionsWithRecordProps<
      V,
      Data,
      Methods,
      Computed,
      Props,
      SetupBindings
    >
  ): ExtendedVue<V, Data, Methods, Computed, Props, SetupBindings>

  /**
   * extend with functional + array props
   */
  extend<PropNames extends string = never>(
    definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>
  ): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>, {}>

  /**
   * extend with functional + object props
   */
  extend<Props>(
    definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>
  ): ExtendedVue<V, {}, {}, {}, Props, {}>

  /**
   * extend with no props
   */
  extend(options?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}, {}>

  nextTick<T>(callback: (this: T) => void, context?: T): void
  nextTick(): Promise<void>
  set<T>(object: object, key: string | number, value: T): T
  set<T>(array: T[], key: number, value: T): T
  delete(object: object, key: string | number): void
  delete<T>(array: T[], key: number): void

  directive(
    id: string,
    definition?: DirectiveOptions | DirectiveFunction
  ): DirectiveOptions
  filter(id: string, definition?: Function): Function

  component(id: string): VueConstructor
  component<VC extends VueConstructor>(id: string, constructor: VC): VC
  component<Data, Methods, Computed, Props, SetupBindings>(
    id: string,
    definition: AsyncComponent<Data, Methods, Computed, Props>
  ): ExtendedVue<V, Data, Methods, Computed, Props, SetupBindings>
  component<
    Data,
    Methods,
    Computed,
    PropNames extends string = never,
    SetupBindings = {}
  >(
    id: string,
    definition?: ThisTypedComponentOptionsWithArrayProps<
      V,
      Data,
      Methods,
      Computed,
      PropNames,
      SetupBindings
    >
  ): ExtendedVue<
    V,
    Data,
    Methods,
    Computed,
    Record<PropNames, any>,
    SetupBindings
  >
  component<Data, Methods, Computed, Props, SetupBindings>(
    id: string,
    definition?: ThisTypedComponentOptionsWithRecordProps<
      V,
      Data,
      Methods,
      Computed,
      Props,
      SetupBindings
    >
  ): ExtendedVue<V, Data, Methods, Computed, Props, SetupBindings>
  component<PropNames extends string>(
    id: string,
    definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>
  ): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>, {}>
  component<Props>(
    id: string,
    definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>
  ): ExtendedVue<V, {}, {}, {}, Props, {}>
  component(
    id: string,
    definition?: ComponentOptions<V>
  ): ExtendedVue<V, {}, {}, {}, {}, {}>
  component<T extends DefineComponent<any, any, any, any, any, any, any, any>>(
    id: string,
    definition?: T
  ): T

  use<T>(
    plugin: PluginObject<T> | PluginFunction<T>,
    options?: T
  ): VueConstructor<V>
  use(
    plugin: PluginObject<any> | PluginFunction<any>,
    ...options: any[]
  ): VueConstructor<V>
  mixin(mixin: VueConstructor | ComponentOptions<Vue>): VueConstructor<V>
  compile(template: string): {
    render(createElement: typeof Vue.prototype.$createElement): VNode
    staticRenderFns: (() => VNode)[]
  }

  observable<T>(obj: T): T

  util: {
    warn(msg: string, vm?: InstanceType<VueConstructor>): void
  }

  config: VueConfiguration
  version: string
}

export const Vue: VueConstructor
