import Vue from "../index";

class Test extends Vue {
  a: number;

  testProperties() {
    this.$data;
    this.$el;
    this.$options;
    this.$parent;
    this.$root;
    this.$children;
    this.$refs;
    this.$slots;
    this.$isServer;
    this.$ssrContext;
  }

  // test property reification
  $refs: {
    vue: Vue,
    element: HTMLInputElement,
    vues: Vue[],
    elements: HTMLInputElement[]
  }
  testReification() {
    this.$refs.vue.$data;
    this.$refs.element.value;
    this.$refs.vues[0].$data;
    this.$refs.elements[0].value;
  }

  testMethods() {
    this.$mount("#app", false);
    this.$forceUpdate();
    this.$destroy();
    this.$set({}, "key", "value");
    this.$delete({}, "key");
    this.$watch("a", (val: number, oldVal: number) => {}, {
      immediate: true,
      deep: false
    })();
    this.$watch(() => this.a, (val: number) => {});
    this.$on("", () => {});
    this.$once("", () => {});
    this.$off("", () => {});
    this.$emit("", 1, 2, 3);
    this.$nextTick(function() {
      this.$nextTick;
    });
    this.$nextTick().then(() => {});
    this.$createElement("div", {}, "message");
  }

  static testConfig() {
    const { config } = this;
    config.silent;
    config.optionMergeStrategies;
    config.devtools;
    config.errorHandler = (err, vm) => {
      if (vm instanceof Test) {
        vm.testProperties();
        vm.testMethods();
      }
    };
    config.keyCodes = { esc: 27 };
  }

  static testMethods() {
    this.extend({
      data() {
        return {
          msg: ""
        };
      }
    });
    this.nextTick(() => {});
    this.nextTick().then(() => {});
    this.set({}, "", "");
    this.set([true, false, true], 1, true);
    this.delete({}, "");
    this.delete([true, false], 0);
    this.directive("", {bind() {}});
    this.filter("", (value: number) => value);
    this.component("", { data: () => ({}) });
    this.component("", { functional: true, render(h) { return h("div", "hello!") } });
    this.use;
    this.mixin(Test);
    this.compile("<div>{{ message }}</div>");
  }
}

const HelloWorldComponent = Vue.extend({
  props: ["name"],
  data() {
    return {
      message: "Hello " + this.name,
    }
  },
  computed: {
    shouted(): string {
      return this.message.toUpperCase();
    }
  },
  methods: {
    getMoreExcited() {
      this.message += "!";
    }
  },
  watch: {
    message(a: string) {
      console.log(`Message ${this.message} was changed!`);
    }
  }
});

const FunctionalHelloWorldComponent = Vue.extend({
  functional: true,
  props: ["name"],
  render(createElement, ctxt) {
    return createElement("div", "Hello " + ctxt.props.name)
  }
})
