import Vue from "../index";

declare module "../vue" {
  // add instance property and method
  interface Vue<Data, Methods, Computed> {
    $instanceProperty: string;
    $instanceMethod(): void;
  }

  // add static property and method
  interface VueConstructor {
    staticProperty: string;
    staticMethod(): void;
  }
}

// augment ComponentOptions
declare module "../options" {
  interface ComponentOptions<Data, Methods, Computed> {
    foo?: string;
  }
}

const vm = new Vue({
  data: {
    a: true
  },
  foo: "foo"
});

vm.$instanceProperty;
vm.$instanceMethod();

Vue.staticProperty;
Vue.staticMethod();
