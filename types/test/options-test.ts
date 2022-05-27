import Vue, { PropType, VNode } from '../index'
import { ComponentOptions, Component } from '../index'
import { CreateElement } from '../vue'

interface MyComponent extends Vue {
  a: number
}

const option: ComponentOptions<MyComponent> = {
  data() {
    return {
      a: 123
    }
  }
}

// contravariant generic should use never
const anotherOption: ComponentOptions<never> = option
const componentType: Component = option

Vue.component('sub-component', {
  components: {
    a: Vue.component(''),
    b: {}
  }
})

Vue.component('prop-component', {
  props: {
    size: Number,
    name: {
      type: String,
      default: '0',
      required: true
    }
  },
  data() {
    return {
      fixedSize: this.size.toFixed(),
      capName: this.name.toUpperCase()
    }
  }
})

Vue.component('string-prop', {
  props: ['size', 'name'],
  data() {
    return {
      fixedSize: this.size.whatever,
      capName: this.name.isany
    }
  }
})

class User {
  private u = 1
}
class Cat {
  private u = 1
}

interface IUser {
  foo: string
  bar: number
}

interface ICat {
  foo: any
  bar: object
}
type ConfirmCallback = (confirm: boolean) => void

Vue.component('union-prop', {
  props: {
    cat: Object as PropType<ICat>,
    complexUnion: { type: [User, Number] as PropType<User | number> },
    kittyUser: Object as PropType<ICat & IUser>,
    callback: Function as PropType<ConfirmCallback>,
    union: [User, Number] as PropType<User | number>
  },
  data() {
    this.cat
    this.complexUnion
    this.kittyUser
    this.callback(true)
    this.union
    return {
      fixedSize: this.union
    }
  }
})

Vue.component('union-prop-with-no-casting', {
  props: {
    mixed: [RegExp, Array],
    object: [Cat, User],
    primitive: [String, Number],
    regex: RegExp
  },
  data() {
    this.mixed
    this.object
    this.primitive
    this.regex.compile
  }
})

Vue.component('prop-with-primitive-default', {
  props: {
    id: {
      type: String,
      default: () => String(Math.round(Math.random() * 10000000))
    }
  },
  created(): void {
    this.id
  }
})

Vue.component('component', {
  data() {
    this.$mount
    this.size
    return {
      a: 1
    }
  },
  props: {
    size: Number,
    name: {
      type: String,
      default: '0',
      required: true
    }
  },
  propsData: {
    msg: 'Hello'
  },
  computed: {
    aDouble(): number {
      return this.a * 2
    },
    aPlus: {
      get(): number {
        return this.a + 1
      },
      set(v: number) {
        this.a = v - 1
      },
      cache: false
    }
  },
  methods: {
    plus(): void {
      this.a++
      this.aDouble.toFixed()
      this.aPlus = 1
      this.size.toFixed()
    }
  },
  watch: {
    a: function (val: number, oldVal: number) {
      console.log(`new: ${val}, old: ${oldVal}`)
    },
    b: 'someMethod',
    c: {
      handler(val, oldVal) {
        this.a = val
      },
      deep: true
    },
    d: {
      handler: 'someMethod',
      immediate: true
    }
  },
  el: '#app',
  template: '<div>{{ message }}</div>',
  render(createElement) {
    return createElement(
      'div',
      {
        attrs: {
          id: 'foo'
        },
        props: {
          myProp: 'bar'
        },
        directives: [
          {
            name: 'a',
            value: 'foo'
          }
        ],
        domProps: {
          innerHTML: 'baz'
        },
        on: {
          click: new Function()
        },
        nativeOn: {
          click: new Function()
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
        ref: 'myRef',
        refInFor: true
      },
      [
        createElement(),
        createElement('div', 'message'),
        createElement(Vue.component('component')),
        createElement({} as ComponentOptions<Vue>),
        createElement({
          functional: true,
          render(c: CreateElement) {
            return createElement()
          }
        }),

        createElement(() => Vue.component('component')),
        createElement(() => ({} as ComponentOptions<Vue>)),
        createElement((resolve, reject) => {
          resolve({} as ComponentOptions<Vue>)
          reject()
        }),

        'message',

        [createElement('div', 'message')]
      ]
    )
  },
  renderError(createElement, err) {
    return createElement('pre', { style: { color: 'red' } }, err.stack)
  },
  staticRenderFns: [],

  beforeCreate() {
    ;(this as any).a = 1
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
  errorCaptured(err, vm, info) {
    err.message
    vm.$emit('error')
    info.toUpperCase()
    return true
  },
  serverPrefetch() {
    return Promise.resolve()
  },

  directives: {
    a: {
      bind() {},
      inserted() {},
      update() {},
      componentUpdated() {},
      unbind() {}
    },
    b(el, binding, vnode, oldVnode) {
      el.textContent

      binding.name
      binding.value
      binding.oldValue
      binding.expression
      binding.arg
      binding.modifiers['modifier']
    }
  },
  components: {
    a: Vue.component(''),
    b: {} as ComponentOptions<Vue>
  },
  transitions: {},
  filters: {
    double(value: number) {
      return value * 2
    }
  },
  parent: new Vue(),
  mixins: [Vue.component(''), {} as ComponentOptions<Vue>],
  name: 'Component',
  extends: {} as ComponentOptions<Vue>,
  delimiters: ['${', '}']
})

Vue.component('custom-prop-type-function', {
  props: {
    callback: Function as PropType<(confirm: boolean) => void>
  },
  methods: {
    confirm() {
      this.callback(true)
    }
  }
})

Vue.component('provide-inject', {
  provide: {
    foo: 1
  },
  inject: {
    injectFoo: 'foo',
    injectBar: Symbol(),
    injectBaz: { from: 'baz' },
    injectQux: { default: 1 },
    injectQuux: { from: 'quuz', default: () => ({ value: 1 }) }
  }
})

Vue.component('provide-function', {
  provide: () => ({
    foo: 1
  })
})

Vue.component('component-with-slot', {
  render(h): VNode {
    return h('div', this.$slots.default)
  }
})

Vue.component('component-with-scoped-slot', {
  render(h) {
    interface ScopedSlotProps {
      msg: string
    }

    return h('div', [
      h('child', [
        // default scoped slot as children
        (props: ScopedSlotProps) => [h('span', [props.msg])]
      ]),
      h('child', {
        scopedSlots: {
          // named scoped slot as vnode data
          item: (props: ScopedSlotProps) => [h('span', [props.msg])]
        }
      }),
      h('child', [
        // return single VNode (will be normalized to an array)
        (props: ScopedSlotProps) => h('span', [props.msg])
      ]),
      h('child', {
        // Passing down all slots from parent
        scopedSlots: this.$scopedSlots
      }),
      h('child', {
        // Passing down single slot from parent
        scopedSlots: {
          default: this.$scopedSlots.default
        }
      })
    ])
  },
  components: {
    child: {
      render(this: Vue, h: CreateElement) {
        const defaultSlot = this.$scopedSlots['default']!({ msg: 'hi' })
        defaultSlot &&
          defaultSlot.forEach(vnode => {
            vnode.tag
          })
        return h('div', [
          defaultSlot,
          this.$scopedSlots['item']!({ msg: 'hello' })
        ])
      }
    }
  }
})

Vue.component('narrow-array-of-vnode-type', {
  render(h): VNode {
    const slot = this.$scopedSlots.default!({})
    if (typeof slot === 'string') {
      // <template slot-scope="data">bare string</template>
      return h('span', slot)
    } else if (Array.isArray(slot)) {
      // template with multiple children
      const first = slot[0]
      if (!Array.isArray(first) && typeof first !== 'string' && first) {
        return first
      } else {
        return h()
      }
    } else if (slot) {
      // <div slot-scope="data">bare VNode</div>
      return slot
    } else {
      // empty template, slot === undefined
      return h()
    }
  }
})

Vue.component('functional-component', {
  props: ['prop'],
  functional: true,
  inject: ['foo'],
  render(createElement, context) {
    context.props
    context.children
    context.slots()
    context.data
    context.parent
    context.scopedSlots
    context.listeners.click
    return createElement('div', {}, context.children)
  }
})

Vue.component('functional-component-object-inject', {
  functional: true,
  inject: {
    foo: 'foo',
    bar: Symbol(),
    baz: { from: 'baz' },
    qux: { default: 1 },
    quux: { from: 'quuz', default: () => ({ value: 1 }) }
  },
  render(h) {
    return h('div')
  }
})

Vue.component('functional-component-check-optional', {
  functional: true
})

Vue.component('functional-component-multi-root', {
  functional: true,
  render(h) {
    return [
      h('tr', [h('td', 'foo'), h('td', 'bar')]),
      h('tr', [h('td', 'lorem'), h('td', 'ipsum')])
    ]
  }
})

Vue.component('async-component', (resolve, reject) => {
  setTimeout(() => {
    resolve(Vue.component('component'))
  }, 0)
  return new Promise(resolve => {
    resolve({
      functional: true,
      render(h: CreateElement) {
        return h('div')
      }
    })
  })
})

Vue.component('functional-component-v-model', {
  props: ['foo'],
  functional: true,
  model: {
    prop: 'foo',
    event: 'change'
  },
  render(createElement, context) {
    return createElement('input', {
      on: {
        input: new Function()
      },
      domProps: {
        value: context.props.foo
      }
    })
  }
})

Vue.component('async-es-module-component', () => import('./es-module'))

Vue.component('directive-expression-optional-string', {
  render(createElement) {
    return createElement('div', {
      directives: [
        {
          name: 'has-expression',
          value: 2,
          expression: '1 + 1'
        },
        {
          name: 'no-expression',
          value: 'foo'
        }
      ]
    })
  }
})
