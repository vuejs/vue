import { Vue } from "../vue.d";
import { ComponentOptions } from "../options.d";

interface Component extends Vue {
  a: number;
}

const Options: ComponentOptions = {
  data() {
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
    plus(this: Component) {
      this.a++;
    }
  },
  watch: {
    'a': function(val: number, oldVal: number) {
      console.log(`new: ${val}, old: ${oldVal}`);
    },
    'b': 'someMethod',
    'c': {
      handler(val: number, oldval: number) {},
      deep: true
    }
  },
  el: "#app",
  template: "<div>{{ message }}</div>",
  render(createElement) {
    return createElement("div", {
      attrs: {
        id: "foo"
      },
      props: {
        myProp: "bar"
      },
      domProps: {
        innerHTML: "baz"
      },
      on: {
        click: new Function
      },
      nativeOn: {
        click: new Function
      },
      class: {
        foo: true,
        bar: false
      },
      style: {
        color: 'red',
        fontSize: '14px'
      },
      key: 'myKey',
      ref: 'myRef'
    }, [
      createElement("div", {}, "message"),
      "message",
      [createElement("div", {}, "message")]
    ]);
  },
  staticRenderFns: [],

  beforeCreate() {},
  created() {},
  beforeDestroy() {},
  destroyed() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},

  directives: {
    a: {
      bind() {},
      update() {},
      componentMounted() {},
      unbind() {}
    },
    b(el, binding, vnode, oldVnode) {
      el.textContent;

      binding.name;
      binding.value;
      binding.oldValue;
      binding.expression;
      binding.arg;
      binding.modifiers["modifier"];
    }
  },
  components: {
    a: Vue.component(""),
    b: {} as ComponentOptions
  },
  transitions: {},
  filters: {
    double(value: number) {
      return value * 2;
    }
  },
  parent: new Vue,
  mixins: [Vue.component(""), ({} as ComponentOptions)],
  name: "Component",
  extends: {} as ComponentOptions,
  delimiters: ["${", "}"]
}
