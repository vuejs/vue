import {
  ComponentOptions,
  WatchOptions,
  WatchHandler,
  DirectiveOptions,
  DirectiveFunction
} from "./options.d";
import { Installer, Plugin } from "./global-api.d";

export declare class Vue {

  constructor(options?: ComponentOptions);

  $data: Object;
  readonly $el: HTMLElement;
  readonly $options: ComponentOptions;
  readonly $parent: Vue;
  readonly $root: Vue;
  readonly $chldren: Vue[];
  readonly $refs: {[key: string]: Vue};
  readonly $isServer: boolean;

  $watch(expOrFn: string | Function, callback: WatchHandler, options: WatchOptions): (() => void);
  $set: typeof Vue.set;
  $delete: typeof Vue.delete;

  $on(event: string, callback: Function): this;
  $once(event: string, callback: Function): this;
  $off(event?: string, callback?: Function): this;
  $emit(event: string, ...args: any[]): this;

  $nextTick(callback?: (this: this) => void): void;

  $mount(elementOrSelector?: Element | String, hydrating?: boolean): this;
  $destroy(): void;


   static config: {
    silent: boolean;
    optionMergeStrategies: any;
    devtools: boolean;
    errorHandler(err: Error, vm: Vue): void;
    keyCodes: { [key: string]: number };
  }

   static extend(options: ComponentOptions): Vue;
   static nextTick(callback: () => void, context?: any[]): void;
   static set<T>(object: Object, key: string, value: T): T;
   static delete(object: Object, key: string): void;
   static directive(id: string, definition?: DirectiveOptions | DirectiveFunction): DirectiveOptions;
   static filter(id: string, definition?: Function): Function;
   static component(id: string, definition?: typeof Vue | ComponentOptions): typeof Vue;
   static use<T>(plugin: Plugin<T> | Installer<T>, options?: T): void;
   static mixin(mixin: typeof Vue | ComponentOptions): void;
   static compile(template: string): { render: Function, RenderFns: Function };
}
