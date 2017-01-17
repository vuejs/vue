import Vue = require("../index");
import { ComponentOptions } from "../index";

interface Component extends Vue {
  a: number;
}

Vue.component('component', {
  data() {
    this.$mount
    this.a
    return {
      a: 1
    }
  },
  props: {
    size: Number,
    name: {
      type: String,
      default: 0,
      required: true,
      validator(value) {
        return value > 0;
      }
    }
  },
  propsData: {
    msg: "Hello"
  },
  computed: {
    aDouble(this: Component) {
      return this.a * 2;
    },
    aPlus: {
      get(this: Component) {
        return this.a + 1;
      },
      set(this: Component, v: number) {
        this.a = v - 1;
      },
      cache: false
    }
  },
  methods: {
    plus() {
      this.a++;
    }
  },
  watch: {
    'a': function(val: number, oldVal: number) {
      console.log(`new: ${val}, old: ${oldVal}`);
    },
    'b': 'someMethod',
    'c': {
      handler(val, oldVal) {
        this.a = val
      },
      deep: true
    }
  },
  el: "#app",
  template: "<div>{{ message }}</div>",

  beforeCreate() {
    this.a = 1;
  },
  created() {},
  beforeDestroy() {},
  destroyed() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},

  directives: {
    a: {
      bind() {},
      inserted() {},
      update() {},
      componentMounted() {},
      unbind() {}
    },
    b(val, newVal) {
      this.el.textContent;

      this.name;
      this.expression;
      this.arg;
      this.modifiers["modifier"];
    }
  },
  components: {
    a: Vue.component(""),
    b: {} as ComponentOptions<Vue>
  },
  transitions: {},
  filters: {
    double(value: number) {
      return value * 2;
    }
  },
  parent: new Vue,
  mixins: [Vue.component(""), ({} as ComponentOptions<Vue>)],
  name: "Component",
  extends: {} as ComponentOptions<Vue>,
  delimiters: ["${", "}"]
} as ComponentOptions<Component>);

Vue.component("async-component", (resolve, reject) => {
  setTimeout(() => {
    resolve(Vue.component("component"));
  }, 0);
  return new Promise((resolve) => {
    resolve({ } as ComponentOptions<Vue>);
  })
});
