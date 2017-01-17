import * as V from './vue';
import * as Options from './options';
import * as Plugin from './plugin';

declare global {
  interface Array<T> {
    $remove(item: T): Array<T>;
    $set(index: any, val: T): T;
  }

  // For the projects/tools that depend on this namespace
  namespace vuejs {
    export type PropOption = Options.PropOptions;
    export type ComputedOption = Options.ComputedOptions<any>;
    export type WatchOption = Options.WatchOptions;
    export type DirectiveOption = Options.DirectiveOptions<Vue>;
    export type Directive = Options.DirectiveInstance<Vue>;
    export type TransitionOpsion = Options.TransitionOptions;
    export type ComponentOption = Options.ComponentOptions<any>;
    export type FilterOption = Options.FilterOptions;
    export type Vue = V.Vue;
    export type VueStatic = typeof V.Vue;
    export type VueConfig = typeof V.Vue.config;
  }
}

// `Vue` in `export = Vue` must be a namespace
// All available types are exported via this namespace
declare namespace Vue {

  export type Component = Options.Component;
  export type AsyncComponent = Options.AsyncComponent;
  export type ComponentOptions<V extends Vue> = Options.ComponentOptions<V>;
  export type PropOptions = Options.PropOptions;
  export type ComputedOptions<V extends Vue> = Options.ComputedOptions<V>;
  export type WatchHandler<V extends Vue> = Options.WatchHandler<V>;
  export type WatchOptions = Options.WatchOptions;
  export type DirectiveInstance<V extends Vue> = Options.DirectiveInstance<V>;
  export type DirectiveFunction<V extends Vue> = Options.DirectiveFunction<V>;
  export type DirectiveOptions<V extends Vue> = Options.DirectiveOptions<V>;
  export type FilterOptions = Options.FilterOptions;
  export type TransitionOpsions = Options.TransitionOptions;

  export type PluginFunction<T> = Plugin.PluginFunction<T>;
  export type PluginObject<T> = Plugin.PluginObject<T>;
}

// TS cannot merge imported class with namespace, declare a subclass to bypass
declare class Vue extends V.Vue { }

export = Vue;
