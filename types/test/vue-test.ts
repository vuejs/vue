import Vue = require("../index");

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
    this.component("", { functional: true });
    this.use;
    this.mixin(Test);
    this.compile("<div>{{ message }}</div>");
  }
}
