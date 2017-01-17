import Vue = require("../index");

declare module "../vue" {
  // add instance property and method
  interface Vue {
    $instanceProperty: string;
    $instanceMethod(): void;
  }

  // add static property and method
  namespace Vue {
    const staticProperty: string;
    function staticMethod(): void;
  }
}

// augment ComponentOptions
declare module "../options" {
  interface ComponentOptions<V extends Vue> {
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
