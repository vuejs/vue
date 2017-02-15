import {
  Component,
  AsyncComponent,
  FilterOptions,
  DirectiveOptions,
  DirectiveFunction,
  ComponentOptions,
  WatchHandler,
  WatchOptions,
  TransitionOptions
} from './options';
import { PluginObject, PluginFunction } from './plugin'

type Dictionary<T> = {
  [key: string]: T;
};

type Plugin<T> = PluginFunction<T> | PluginObject<T>;
type Filter = Function | FilterOptions;
type Directive = DirectiveFunction<Vue> | DirectiveOptions<Vue>;

export declare class Vue {
  constructor(options?: ComponentOptions<Vue>);

  $data: any;
  readonly $el: HTMLElement;
  readonly $options: ComponentOptions<Vue>;
  readonly $parent: Vue;
  readonly $root: Vue;
  readonly $children: Vue[];
  readonly $refs: Dictionary<Vue | Vue[]>;
  readonly $els: Dictionary<Element | Element[]>;

  $watch(
    expOrFn: string | Function,
    callback: WatchHandler<this>,
    options?: WatchOptions
  ): () => void;
  $get(expression: string): any;
  $set<T>(keypath: string, value: T): T;
  $delete(key: string): void;
  $eval(expression: string): any;
  $interpolate(templateString: string): any;
  $log(keypath?: string): void;

  $on(event: string, callback: Function): this;
  $once(event: string, callback: Function): this;
  $off(event: string, callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
  $broadcast(event: string, ...args: any[]): this;
  $dispatch(event: string, ...args: any[]): this;

  $appendTo(elementOrSelector: HTMLElement | string, callback?: Function): this;
  $before(elementOrSelector: HTMLElement | string, callback?: Function): this;
  $after(elementOrSelector: HTMLElement | string, callback?: Function): this;
  $remove(callback?: Function): this;
  $nextTick(callback: (this: this) => void): void;

  $mount(elementOrSelector?: HTMLElement | string): this;
  $destroy(remove?: boolean): void;

  static extend(options: ComponentOptions<Vue>): typeof Vue;
  static nextTick(callback: () => void, context?: any[]): void;
  static set<T>(object: any, key: string, value: T): T;
  static delete(object: any, key: string): void;
  static directive<T extends Directive>(id: string, definition?: T): T;
  static elementDirective<T extends Directive>(id: string, definition?: T): T;
  static filter<T extends Filter>(id: string, definition?: T): T;
  static component<V extends Vue>(id: string, definition?: ComponentOptions<V> | AsyncComponent): ComponentOptions<V>;
  static transition(id: string, hooks?: TransitionOptions): TransitionOptions;
  static partial(id: string, partial?: string): string;
  static use<T>(plugin: Plugin<T>, options?: T): void;
  static mixin(mixin: Component): void;

  static config: {
    debug: boolean;
    delimiters: [string, string];
    unsafeDelimiters: [string, string];
    silent: boolean;
    async: boolean;
    devtools: boolean;
  }
}
