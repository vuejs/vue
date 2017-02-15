import Vue = require("../index");

class Test extends Vue {
  testProperties() {
    this.$data;
    this.$el;
    this.$options;
    this.$parent;
    this.$root;
    this.$children;
    this.$refs;
  }

  // test property reification
  $refs: {
    vue: Vue;
    vues: Vue[];
  }
  $els: {
    element: HTMLInputElement;
    elements: HTMLInputElement[];
  }
  testReification() {
    this.$refs.vue.$data;
    this.$refs.vues[0].$data;

    this.$els.element.value;
    this.$els.elements[0].value;
  }

  testMethods() {
    this.$watch("a", (val: number, oldVal: number) => {}, {
      immediate: true,
      deep: false
    })();
    this.$watch(() => {}, (val: number) => {});
    this.$get("");
    this.$set("key", "value");
    this.$delete("key");
    this.$eval("");
    this.$interpolate("");
    this.$log("");

    this.$on("", () => {});
    this.$once("", () => {});
    this.$off("", () => {});
    this.$emit("", 1, 2, 3);
    this.$broadcast("", 1, 2, 3);
    this.$dispatch("", 1, 2, 3);

    this.$appendTo("", () => {});
    this.$before("", () => {});
    this.$after("", () => {});
    this.$remove(() => {});
    this.$nextTick(function() {
      this.$nextTick;
    });

    this.$mount("#app");
    this.$destroy(true);
  }

  static testConfig() {
    const { config } = this;
    config.debug;
    config.delimiters;
    config.unsafeDelimiters;
    config.silent;
    config.async;
    config.devtools;
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
    this.set({}, "", "");
    this.delete({}, "");
    this.directive("", {bind() {}});
    this.elementDirective("", {bind() {}});
    this.filter("", (value: number) => value);
    this.component("", { data: () => ({}) });
    this.use;
    this.mixin(Test);
  }
}
