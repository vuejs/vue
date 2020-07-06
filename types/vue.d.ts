import {
  ComputedOptions,
  MethodOptions,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithObjectProps,
  ComponentOptionsMixin,
  RenderFunction,
} from "./componentOptions";
import { FunctionalComponent, PublicAPIComponent } from "./component";
import {
  CreateComponentPublicInstance,
  ComponentPublicInstanceConstructor,
} from "./componentProxy";
import { ExtractPropTypes, ComponentPropsOptions } from "./componentProps";
import { EmitsOptions } from "./componentEmits";
import { h, CreateElement } from "./h";
import { Directive } from "./directives";

export interface Vue {
  readonly $el: Element;
  readonly $options: ComponentOptions<Vue>;
  readonly $parent: Vue;
  readonly $root: Vue;
  readonly $children: Vue[];
  readonly $refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  readonly $slots: { [key: string]: VNode[] | undefined };
  readonly $scopedSlots: { [key: string]: NormalizedScopedSlot | undefined };
  readonly $isServer: boolean;
  readonly $data: Record<string, any>;
  readonly $props: Record<string, any>;
  readonly $ssrContext: any;
  readonly $vnode: VNode;
  readonly $attrs: Record<string, string>;
  readonly $listeners: Record<string, Function | Function[]>;

  $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
  $forceUpdate(): void;
  $destroy(): void;
  $set: typeof Vue.set;
  $delete: typeof Vue.delete;
  $watch(
    expOrFn: string,
    callback: (this: this, n: any, o: any) => void,
    options?: WatchOptions
  ): () => void;
  $watch<T>(
    expOrFn: (this: this) => T,
    callback: (this: this, n: T, o: T) => void,
    options?: WatchOptions
  ): () => void;
  $on(event: string | string[], callback: Function): this;
  $once(event: string | string[], callback: Function): this;
  $off(event?: string | string[], callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
  $nextTick(callback: (this: this) => void): void;
  $nextTick(): Promise<void>;
  $createElement: CreateElement;
}

// export type CombinedVueInstance<
//   Instance extends Vue,
//   Data,
//   Methods,
//   Computed,
//   Props
// > = Data & Methods & Computed & Props & Instance;
// export type ExtendedVue<
//   Instance extends Vue,
//   Data,
//   Methods,
//   Computed,
//   Props
// > = VueConstructor<
//   CombinedVueInstance<Instance, Data, Methods, Computed, Props> & Vue
// >;

export interface VueConfiguration {
  silent: boolean;
  optionMergeStrategies: any;
  devtools: boolean;
  productionTip: boolean;
  performance: boolean;
  errorHandler(err: Error, vm: Vue, info: string): void;
  warnHandler(msg: string, vm: Vue, trace: string): void;
  ignoredElements: (string | RegExp)[];
  keyCodes: { [key: string]: number | number[] };
  async: boolean;
}

//   export interface VueConstructor<V extends Vue = Vue> {
//     new <
//       Data = object,
//       Methods = object,
//       Computed = object,
//       PropNames extends string = never
//     >(
//       options?: ThisTypedComponentOptionsWithArrayProps<
//         V,
//         Data,
//         Methods,
//         Computed,
//         PropNames
//       >
//     ): CombinedVueInstance<V, Data, Methods, Computed, Record<PropNames, any>>;
//     // ideally, the return type should just contain Props, not Record<keyof Props, any>. But TS requires to have Base constructors with the same return type.
//     new <Data = object, Methods = object, Computed = object, Props = object>(
//       options?: ThisTypedComponentOptionsWithRecordProps<
//         V,
//         Data,
//         Methods,
//         Computed,
//         Props
//       >
//     ): CombinedVueInstance<V, Data, Methods, Computed, Record<keyof Props, any>>;
//     new (options?: ComponentOptions<V>): CombinedVueInstance<
//       V,
//       object,
//       object,
//       object,
//       Record<keyof object, any>
//     >;

//     extend<Data, Methods, Computed, PropNames extends string = never>(
//       options?: ThisTypedComponentOptionsWithArrayProps<
//         V,
//         Data,
//         Methods,
//         Computed,
//         PropNames
//       >
//     ): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>;
//     extend<Data, Methods, Computed, Props>(
//       options?: ThisTypedComponentOptionsWithRecordProps<
//         V,
//         Data,
//         Methods,
//         Computed,
//         Props
//       >
//     ): ExtendedVue<V, Data, Methods, Computed, Props>;
//     extend<PropNames extends string = never>(
//       definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>
//     ): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>>;
//     extend<Props>(
//       definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>
//     ): ExtendedVue<V, {}, {}, {}, Props>;
//     extend(options?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}>;

//     nextTick<T>(callback: (this: T) => void, context?: T): void;
//     nextTick(): Promise<void>;
//     set<T>(object: object, key: string | number, value: T): T;
//     set<T>(array: T[], key: number, value: T): T;
//     delete(object: object, key: string | number): void;
//     delete<T>(array: T[], key: number): void;

//     directive(
//       id: string,
//       definition?: DirectiveOptions | DirectiveFunction
//     ): DirectiveOptions;
//     filter(id: string, definition?: Function): Function;

//     component(id: string): VueConstructor;
//     component<VC extends VueConstructor>(id: string, constructor: VC): VC;
//     component<Data, Methods, Computed, Props>(
//       id: string,
//       definition: AsyncComponent<Data, Methods, Computed, Props>
//     ): ExtendedVue<V, Data, Methods, Computed, Props>;
//     component<Data, Methods, Computed, PropNames extends string = never>(
//       id: string,
//       definition?: ThisTypedComponentOptionsWithArrayProps<
//         V,
//         Data,
//         Methods,
//         Computed,
//         PropNames
//       >
//     ): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>;
//     component<Data, Methods, Computed, Props>(
//       id: string,
//       definition?: ThisTypedComponentOptionsWithRecordProps<
//         V,
//         Data,
//         Methods,
//         Computed,
//         Props
//       >
//     ): ExtendedVue<V, Data, Methods, Computed, Props>;
//     component<PropNames extends string>(
//       id: string,
//       definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>
//     ): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>>;
//     component<Props>(
//       id: string,
//       definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>
//     ): ExtendedVue<V, {}, {}, {}, Props>;
//     component(
//       id: string,
//       definition?: ComponentOptions<V>
//     ): ExtendedVue<V, {}, {}, {}, {}>;

//     use<T>(
//       plugin: PluginObject<T> | PluginFunction<T>,
//       options?: T
//     ): VueConstructor<V>;
//     use(
//       plugin: PluginObject<any> | PluginFunction<any>,
//       ...options: any[]
//     ): VueConstructor<V>;
//     mixin(mixin: VueConstructor | ComponentOptions<Vue>): VueConstructor<V>;

//     compile(
//       template: string
//     ): {
//       render(createElement: typeof Vue.prototype.$createElement): VNode;
//       staticRenderFns: (() => VNode)[];
//     };

//     observable<T>(obj: T): T;

//     config: VueConfiguration;
//     version: string;
//   }

type VNodeProps = Record<string, any>; // ??

export interface VueConstructor {
  // defineComponent is a utility that is primarily used for type inference
  // when declaring components. Type inference is provided in the component
  // options (provided as the argument). The returned value has artificial types
  // for TSX / manual render function / IDE support.

  // overload 2: object format with no props
  // (uses user defined props interface)
  // return type is for Vetur and TSX support
  new <
    Props = {},
    D = {},
    C extends ComputedOptions = {},
    M extends MethodOptions = {},
    Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
    Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
    E extends EmitsOptions = Record<string, any>,
    EE extends string = string
  >(
    options: ComponentOptionsWithoutProps<Props, D, C, M, Mixin, Extends, E, EE>
  ): CreateComponentPublicInstance<
    Props,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    VNodeProps & Props
  >;

  // overload 3: object format with array props declaration
  // props inferred as { [key in PropNames]?: any }
  // return type is for Vetur and TSX support
  new <
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
  ): // array props technically doesn't place any contraints on props in TSX before,
  // but now we can export array props in TSX
  CreateComponentPublicInstance<
    Readonly<{ [key in PropNames]?: any }>,
    D,
    C,
    M,
    Mixin,
    Extends,
    E
  >;

  // overload 4: object format with object props declaration
  // see `ExtractPropTypes` in ./componentProps.ts
  new <
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
  ): CreateComponentPublicInstance<
    ExtractPropTypes<PropsOptions, false>,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    VNodeProps
  >;

  component(name: string): PublicAPIComponent | undefined;
  component<
    Props = {},
    D = {},
    C extends ComputedOptions = {},
    M extends MethodOptions = {},
    Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
    Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
    E extends EmitsOptions = Record<string, any>,
    EE extends string = string
  >(
    name: string,
    component: ComponentOptionsWithoutProps<
      Props,
      D,
      C,
      M,
      Mixin,
      Extends,
      E,
      EE
    >
  ): this;

  // overload 3: object format with array props declaration
  // props inferred as { [key in PropNames]?: any }
  // return type is for Vetur and TSX support
  component<
    PropNames extends string,
    D,
    C extends ComputedOptions = {},
    M extends MethodOptions = {},
    Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
    Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
    E extends EmitsOptions = Record<string, any>,
    EE extends string = string
  >(
    name: string,
    component: ComponentOptionsWithArrayProps<
      PropNames,
      D,
      C,
      M,
      Mixin,
      Extends,
      E,
      EE
    >
  ): this;

  // overload 4: object format with object props declaration
  // see `ExtractPropTypes` in ./componentProps.ts
  component<
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
    name: string,
    component: ComponentOptionsWithObjectProps<
      PropsOptions,
      D,
      C,
      M,
      Mixin,
      Extends,
      E,
      EE
    >
  ): this;
  component(name: string, component: PublicAPIComponent): this;
  
  directive(name: string): Directive | undefined;
  directive(name: string, directive: Directive): this;
}

export const Vue: VueConstructor;
