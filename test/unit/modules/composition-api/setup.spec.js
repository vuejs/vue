const Vue = require('vue/dist/vue.common.js')
const {
  ref,
  computed,
  h,
  provide,
  inject,
  reactive,
  toRefs,
  markRaw,
  toRaw,
  nextTick,
  isReactive,
  defineComponent,
  onMounted,
} = require('../src')
const { sleep } = require('./helpers/utils')

describe('setup', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('should works', () => {
    const vm = new Vue({
      setup() {
        return {
          a: ref(1),
        }
      },
    }).$mount()
    expect(vm.a).toBe(1)
  })

  it('should work with non reactive null', () => {
    const vm = new Vue({
      setup() {
        return {
          a: null,
        }
      },
    }).$mount()
    expect(vm.a).toBe(null)
  })

  it('should work with non reactive undefined', () => {
    const vm = new Vue({
      setup() {
        return {
          a: undefined,
          b: 'foobar',
        }
      },
    }).$mount()
    expect(vm.a).toBe(undefined)
    expect(vm.b).toBe('foobar')
  })

  it('should be overridden by data option of plain object', () => {
    const vm = new Vue({
      setup() {
        return {
          a: ref(1),
        }
      },
      data: {
        a: 2,
      },
    }).$mount()
    expect(vm.a).toBe(2)
  })

  it("should access setup's value in data", () => {
    const vm = new Vue({
      setup() {
        return {
          a: ref(1),
        }
      },
      data() {
        return {
          b: this.a,
        }
      },
    }).$mount()
    expect(vm.a).toBe(1)
    expect(vm.b).toBe(1)
  })

  it('should work with `methods` and `data` options', (done) => {
    let calls = 0
    const vm = new Vue({
      template: `<div>{{a}}{{b}}{{c}}</div>`,
      setup() {
        return {
          a: ref(1),
        }
      },
      beforeUpdate() {
        calls++
      },
      created() {
        this.m()
      },
      data() {
        return {
          b: this.a,
          c: 0,
        }
      },
      methods: {
        m() {
          this.c = this.a
        },
      },
    }).$mount()
    expect(vm.a).toBe(1)
    expect(vm.b).toBe(1)
    expect(vm.c).toBe(1)
    vm.a = 2
    waitForUpdate(() => {
      expect(calls).toBe(1)
      expect(vm.a).toBe(2)
      expect(vm.b).toBe(1)
      expect(vm.c).toBe(1)
      vm.b = 2
    })
      .then(() => {
        expect(calls).toBe(2)
        expect(vm.a).toBe(2)
        expect(vm.b).toBe(2)
        expect(vm.c).toBe(1)
      })
      .then(done)
  })

  it('should receive props as first params', () => {
    let props
    new Vue({
      props: ['a'],
      setup(_props) {
        props = _props
      },
      propsData: {
        a: 1,
      },
    }).$mount()
    expect(props.a).toBe(1)
  })

  it('warn for existing props', () => {
    new Vue({
      props: {
        a: {},
      },
      setup() {
        const a = ref()
        return {
          a,
        }
      },
    })
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: The setup binding property "a" is already declared as a prop.'
    )
  })

  it('warn for existing instance properties', () => {
    new Vue({
      setup(_, { _vm }) {
        _vm.a = 1
        return {
          a: ref(),
        }
      },
    })
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: The setup binding property "a" is already declared.'
    )
  })

  // `props` are not deeply reactive
  it('not warn doing toRef on props', async () => {
    const Foo = {
      props: {
        obj: {
          type: Object,
          required: true,
        },
      },
      setup(props) {
        return () =>
          h('div', null, [
            h('span', toRefs(props.obj).bar.value),
            h('span', toRefs(props.obj.nested).baz.value),
          ])
      },
    }

    let bar
    let baz

    const vm = new Vue({
      template: `<div id="app"><Foo :obj="obj" /></div>`,
      components: { Foo },
      setup() {
        bar = ref(3)
        baz = ref(1)
        return {
          obj: {
            bar,
            nested: {
              baz,
            },
          },
        }
      },
    })
    vm.$mount()

    expect(vm.$el.textContent).toBe('31')

    bar.value = 4
    baz.value = 2

    await vm.$nextTick()
    expect(vm.$el.textContent).toBe('42')

    expect(warn).toHaveBeenCalledTimes(4) // 2 renders - 2 calls each render
  })

  it('should merge result properly', () => {
    const injectKey = Symbol('foo')
    const A = Vue.extend({
      setup() {
        provide(injectKey, 'foo')
        return { a: 1 }
      },
    })
    const Test = Vue.extend({
      extends: A,
      setup() {
        const injectVal = inject(injectKey)
        return {
          injectVal,
        }
      },
    })
    let vm = new Test({
      setup() {
        return { b: 2 }
      },
    })
    expect(vm.a).toBe(1)
    expect(vm.b).toBe(2)
    expect(vm.injectVal).toBe('foo')
    // no instance data
    vm = new Test()
    expect(vm.a).toBe(1)
    // no child-val
    const Extended = Test.extend({})
    vm = new Extended()
    expect(vm.a).toBe(1)
    // recursively merge objects
    const WithObject = Vue.extend({
      setup() {
        return {
          obj: {
            a: 1,
          },
        }
      },
    })
    vm = new WithObject({
      setup() {
        return {
          obj: {
            b: 2,
          },
        }
      },
    })
    expect(vm.obj.a).toBe(1)
    expect(vm.obj.b).toBe(2)
  })

  it('should have access to props', () => {
    const Test = {
      props: ['a'],
      render() {},
      setup(props) {
        return {
          b: props.a,
        }
      },
    }
    const vm = new Vue({
      template: `<test ref="test" :a="1"></test>`,
      components: { Test },
    }).$mount()
    expect(vm.$refs.test.b).toBe(1)
  })

  it('props should be reactive', (done) => {
    let calls = 0
    let _props
    const vm = new Vue({
      template: `<child :msg="msg"></child>`,
      setup() {
        return { msg: ref('hello') }
      },
      beforeUpdate() {
        calls++
      },
      components: {
        child: {
          template: `<span>{{ localMsg }}</span>`,
          props: ['msg'],
          setup(props) {
            _props = props

            return {
              localMsg: props.msg,
              computedMsg: computed(() => props.msg + ' world'),
            }
          },
        },
      },
    }).$mount()

    expect(isReactive(_props)).toBe(true)

    const child = vm.$children[0]
    expect(child.localMsg).toBe('hello')
    expect(child.computedMsg).toBe('hello world')
    expect(calls).toBe(0)
    vm.msg = 'hi'
    waitForUpdate(() => {
      expect(child.localMsg).toBe('hello')
      expect(child.computedMsg).toBe('hi world')
      expect(calls).toBe(1)
    }).then(done)
  })

  it('toRefs(props) should not warn', async () => {
    let a

    const child = {
      template: `<div/>`,

      props: {
        r: Number,
      },
      setup(props) {
        a = toRefs(props).r
      },
    }

    const vm = new Vue({
      template: `<child :r="r"/>`,
      components: {
        child,
      },

      data() {
        return {
          r: 1,
        }
      },
    }).$mount()

    expect(a.value).toBe(1)
    vm.r = 3

    await Vue.nextTick()

    expect(a.value).toBe(3)

    expect(warn).not.toHaveBeenCalled()
  })

  it('Should allow to return Object.freeze', () => {
    const vm = new Vue({
      template: `<div>{{foo.bar}}</div>`,
      setup() {
        const foo = Object.freeze({ bar: 'baz' })
        return {
          foo,
        }
      },
    }).$mount()
    expect(vm.$el.textContent).toBe('baz')
  })

  it('this should be undefined', () => {
    const vm = new Vue({
      template: '<div></div>',
      setup() {
        expect(this).toBe(global)
      },
    }).$mount()
  })

  it('should not make returned non-reactive object reactive', (done) => {
    const vm = new Vue({
      setup() {
        return {
          form: {
            a: 1,
            b: 2,
          },
        }
      },
      template: '<div>{{ form.a }}, {{ form.b }}</div>',
    }).$mount()
    expect(vm.$el.textContent).toBe('1, 2')

    // should not trigger a re-render
    vm.form.a = 2
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('1, 2')

      // not trigger event
      vm.form = { a: 2, b: 3 }
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('1, 2')
      })
      .then(done)
  })

  it("should put a unenumerable '__ob__' for non-reactive object", () => {
    const clone = (obj) => JSON.parse(JSON.stringify(obj))
    const componentSetup = jest.fn((props) => {
      const internalOptions = clone(props.options)
      return { internalOptions }
    })
    const ExternalComponent = {
      props: ['options'],
      setup: componentSetup,
    }
    new Vue({
      components: { ExternalComponent },
      setup: () => ({ options: {} }),
      template: `<external-component :options="options"></external-component>`,
    }).$mount()
    expect(componentSetup).toReturn()
  })

  it('current vue should exist in nested setup call', () => {
    const spy = jest.fn()
    new Vue({
      setup() {
        new Vue({
          setup() {
            spy(1)
          },
        })

        spy(2)
      },
    })
    expect(spy.mock.calls.length).toBe(2)
    expect(spy).toHaveBeenNthCalledWith(1, 1)
    expect(spy).toHaveBeenNthCalledWith(2, 2)
  })

  it('inline render function should receive proper params', () => {
    let p
    const vm = new Vue({
      template: `<child msg="foo" a="1" b="2"></child>`,
      components: {
        child: {
          name: 'child',
          props: ['msg'],
          setup() {
            return (props) => {
              p = props
              return null
            }
          },
        },
      },
    }).$mount()
    expect(p).toBe(undefined)
  })

  it('inline render function should work', (done) => {
    // let createElement;
    const vm = new Vue({
      props: ['msg'],
      template: '<div>1</div>',
      setup(props) {
        const count = ref(0)
        const increment = () => {
          count.value++
        }

        return () =>
          h('div', [
            h('span', props.msg),
            h(
              'button',
              {
                on: {
                  click: increment,
                },
              },
              count.value
            ),
          ])
      },
      propsData: {
        msg: 'foo',
      },
    }).$mount()
    expect(vm.$el.querySelector('span').textContent).toBe('foo')
    expect(vm.$el.querySelector('button').textContent).toBe('0')
    vm.$el.querySelector('button').click()
    waitForUpdate(() => {
      expect(vm.$el.querySelector('button').textContent).toBe('1')
      vm.msg = 'bar'
    })
      .then(() => {
        expect(vm.$el.querySelector('span').textContent).toBe('bar')
      })
      .then(done)
  })

  describe('setup unwrap', () => {
    test('ref', () => {
      const vm = new Vue({
        setup() {
          const r = ref('r')

          const refList = ref([ref('1'), ref('2'), ref('3')])
          const list = [ref('a'), ref('b')]

          return {
            r,
            refList,
            list,
          }
        },
        template: `<div>
          <p id="r">{{r}}</p>
          <p id="list">{{list}}</p>
          <p id="refList">{{refList}}</p>
        </div>`,
      }).$mount()

      expect(vm.$el.querySelector('#r').textContent).toBe('r')

      // shouldn't unwrap arrays
      expect(
        JSON.parse(vm.$el.querySelector('#list').textContent)
      ).toMatchObject([{ value: 'a' }, { value: 'b' }])
      expect(
        JSON.parse(vm.$el.querySelector('#refList').textContent)
      ).toMatchObject([{ value: '1' }, { value: '2' }, { value: '3' }])

      expect(warn).not.toHaveBeenCalled()
    })

    test('nested', () => {
      const vm = new Vue({
        setup() {
          const nested = {
            a: ref('a'),
            aa: {
              b: ref('aa'),
              bb: {
                cc: ref('aa'),
                c: 'aa',
              },
            },

            aaa: reactive({
              b: ref('aaa'),
              bb: {
                c: ref('aaa'),
                cc: 'aaa',
              },
            }),

            aaaa: {
              b: [1],
              bb: ref([1]),
              bbb: reactive({
                c: [1],
                cc: ref([1]),
              }),
              bbbb: [ref(1)],
            },
          }

          return {
            nested,
          }
        },
        template: `<div>
          <p id="nested">{{nested.a}}</p>
  
          <p id="nested_aa_b">{{ nested.aa.b }}</p>
          <p id="nested_aa_bb_c">{{ nested.aa.bb.c }}</p>
          <p id="nested_aa_bb_cc">{{ nested.aa.bb.cc }}</p>
  
          <p id="nested_aaa_b">{{ nested.aaa.b }}</p>
          <p id="nested_aaa_bb_c">{{ nested.aaa.bb.c }}</p>
          <p id="nested_aaa_bb_cc">{{ nested.aaa.bb.cc }}</p>
  
          <p id="nested_aaaa_b">{{ nested.aaaa.b }}</p>
          <p id="nested_aaaa_bb_c">{{ nested.aaaa.bb }}</p>
          <p id="nested_aaaa_bbb_cc">{{ nested.aaaa.bbb.c }}</p>
          <p id="nested_aaaa_bbb_cc">{{ nested.aaaa.bbb.cc }}</p>
          <p id="nested_aaaa_bbbb">{{ nested.aaaa.bbbb }}</p>
        </div>`,
      }).$mount()

      expect(
        JSON.parse(vm.$el.querySelector('#nested').textContent)
      ).toMatchObject({
        value: 'a',
      })

      expect(
        JSON.parse(vm.$el.querySelector('#nested_aa_b').textContent)
      ).toMatchObject({
        value: 'aa',
      })
      expect(vm.$el.querySelector('#nested_aa_bb_c').textContent).toBe('aa')
      expect(
        JSON.parse(vm.$el.querySelector('#nested_aa_bb_cc').textContent)
      ).toMatchObject({ value: 'aa' })

      expect(vm.$el.querySelector('#nested_aaa_b').textContent).toBe('aaa')
      expect(vm.$el.querySelector('#nested_aaa_bb_c').textContent).toBe('aaa')
      expect(vm.$el.querySelector('#nested_aaa_bb_cc').textContent).toBe('aaa')

      expect(warn).not.toHaveBeenCalled()
    })

    it('recursive', () => {
      const vm = new Vue({
        setup() {
          const b = {
            c: 'c',
          }

          const recursive = {
            a: {
              a: 'a',
              b,
            },
          }

          b.recursive = recursive
          b.r = ref('r')

          return {
            recursive,
          }
        },
        template: `<div>
          <p id="recursive_a">{{recursive.a.a}}</p>
          <p id="recursive_b_c">{{recursive.a.b.c}}</p>
          <p id="recursive_b_r">{{recursive.a.b.r}}</p>

          <p id="recursive_b_recursive_a">{{recursive.a.b.recursive.a.a}}</p>
          <p id="recursive_b_recursive_c">{{recursive.a.b.recursive.a.b.c}}</p>
          <p id="recursive_b_recursive_r">{{recursive.a.b.recursive.a.b.r}}</p>
          
          <p id="recursive_b_recursive_recursive_c">{{recursive.a.b.recursive.a.b.recursive.a.b.c}}</p>
          <p id="recursive_b_recursive_recursive_r">{{recursive.a.b.recursive.a.b.recursive.a.b.r}}</p>
        </div>`,
      }).$mount()
      expect(vm.$el.querySelector('#recursive_a').textContent).toBe('a')
      expect(vm.$el.querySelector('#recursive_b_c').textContent).toBe('c')
      expect(
        JSON.parse(vm.$el.querySelector('#recursive_b_r').textContent)
      ).toMatchObject({ value: 'r' })

      expect(vm.$el.querySelector('#recursive_b_recursive_a').textContent).toBe(
        'a'
      )
      expect(vm.$el.querySelector('#recursive_b_recursive_c').textContent).toBe(
        'c'
      )
      expect(
        JSON.parse(vm.$el.querySelector('#recursive_b_recursive_r').textContent)
      ).toMatchObject({ value: 'r' })

      expect(
        vm.$el.querySelector('#recursive_b_recursive_recursive_c').textContent
      ).toBe('c')

      expect(
        JSON.parse(
          vm.$el.querySelector('#recursive_b_recursive_recursive_r').textContent
        )
      ).toMatchObject({ value: 'r' })

      expect(warn).not.toHaveBeenCalled()
    })

    // #384
    it('not unwrap when is raw', () => {
      const vm = new Vue({
        setup() {
          const xx = {
            ref: ref('r'),
          }
          const r = markRaw(xx)
          return {
            r,
          }
        },
        template: `<div>
          <p id="r">{{r}}</p>
        </div>`,
      }).$mount()

      expect(JSON.parse(vm.$el.querySelector('#r').textContent)).toMatchObject({
        ref: {
          value: 'r',
        },
      })

      expect(warn).not.toHaveBeenCalled()
    })

    // #392
    it('should copy __ob__ and make toRaw work when passing via props', () => {
      let propsObj = null

      const Foo = {
        template: '<p>{{obj.bar}}</p>',
        props: {
          obj: {
            type: Object,
            required: true,
          },
        },
        setup(props) {
          propsObj = toRaw(props.obj)
          return {}
        },
      }

      const vm = new Vue({
        template: '<Foo :obj="obj" />',
        components: { Foo },
        setup() {
          return { obj: { bar: ref(1) } }
        },
      }).$mount()

      expect(JSON.parse(vm.$el.textContent)).toMatchObject({ value: 1 })
      expect(propsObj).toMatchObject({ bar: { value: 1 } })

      expect(warn).not.toHaveBeenCalled()
    })
  })

  it('should not unwrap built-in objects on the template', () => {
    const date = new Date('2020-01-01')
    const regex = /a(b).*/
    const dateString = date.toString()
    const regexString = regex.toString()
    const mathString = Math.toString()

    const vm = new Vue({
      setup() {
        return {
          raw_date: date,
          nested_date: {
            a: date,
            b: date,
          },
          raw_regex: regex,
          nested_regex: {
            a: regex,
            b: regex,
          },
          math: Math,
        }
      },
      template: `<div>
        <p id="raw_date">{{raw_date}}</p>
        <p id="nested_date">{{nested_date}}</p>
        <p id="raw_regex">{{raw_regex}}</p>
        <p id="nested_regex_a">{{nested_regex.a}}</p>
        <p id="nested_regex_b">{{nested_regex.b}}</p>
        <p id="math">{{math}}</p>
      </div>`,
    }).$mount()

    expect(vm.$el.querySelector('#raw_date').textContent).toBe(dateString)
    expect(
      JSON.parse(vm.$el.querySelector('#nested_date').textContent)
    ).toMatchObject(
      JSON.parse(
        JSON.stringify({
          a: date,
          b: date,
        })
      )
    )
    expect(vm.$el.querySelector('#raw_regex').textContent).toBe(regexString)
    expect(vm.$el.querySelector('#nested_regex_a').textContent).toBe(
      regexString
    )
    expect(vm.$el.querySelector('#nested_regex_b').textContent).toBe(
      regexString
    )
    expect(vm.$el.querySelector('#math').textContent).toBe(mathString)
  })

  describe('Methods', () => {
    it('binds methods when calling with parenthesis', async () => {
      let context = null
      const contextFunction = jest.fn(function () {
        context = this
      })

      const vm = new Vue({
        template: '<div><button @click="contextFunction()"/></div>',
        setup() {
          return {
            contextFunction,
          }
        },
      }).$mount()

      await vm.$el.querySelector('button').click()
      expect(contextFunction).toBeCalled()
      expect(context).toBe(vm)
    })

    it('binds methods when calling without parenthesis', async () => {
      let context = null
      const contextFunction = jest.fn(function () {
        context = this
      })

      const vm = new Vue({
        template: '<div><button @click="contextFunction"/></div>',
        setup() {
          return {
            contextFunction,
          }
        },
      }).$mount()

      await vm.$el.querySelector('button').click()
      expect(contextFunction).toBeCalled()
      expect(context).toBe(vm)
    })
  })

  it('should work after extending with an undefined setup', () => {
    const opts = {
      setup() {
        return () => h('div', 'Composition-api')
      },
    }
    const Constructor = Vue.extend(opts).extend({})

    const vm = new Vue(Constructor).$mount()
    expect(vm.$el.textContent).toBe('Composition-api')
  })

  // #487
  it('should handle updates for directly return a reactive object.', async () => {
    const opts = {
      template: '<div>{{ count }}</div>',
      setup() {
        const state = reactive({ count: 1 })

        setTimeout(() => {
          state.count = 2
        }, 1)

        return state
      },
    }
    const Constructor = Vue.extend(opts).extend({})

    const vm = new Vue(Constructor).$mount()
    expect(vm.$el.textContent).toBe('1')
    await sleep(10)
    await nextTick()
    expect(vm.$el.textContent).toBe('2')
  })

  // #524
  it('should work with reactive arrays.', async () => {
    const opts = {
      template: `<div>{{items.length}}</div>`,
      setup() {
        const items = reactive([])

        setTimeout(() => {
          items.push(2)
        }, 1)

        return {
          items,
        }
      },
    }
    const Constructor = Vue.extend(opts).extend({})

    const vm = new Vue(Constructor).$mount()
    expect(vm.$el.textContent).toBe('0')
    await sleep(10)
    await nextTick()
    expect(vm.$el.textContent).toBe('1')
  })

  it('should work with reactive array nested', async () => {
    const opts = {
      template: `<div>{{a.items.length}}</div>`,
      setup() {
        const items = reactive([])

        setTimeout(() => {
          items.push(2)
        }, 1)

        return {
          a: {
            items,
          },
        }
      },
    }
    const Constructor = Vue.extend(opts).extend({})

    const vm = new Vue(Constructor).$mount()
    expect(vm.$el.textContent).toBe('0')
    await sleep(10)
    await nextTick()
    expect(vm.$el.textContent).toBe('1')
  })

  it('should not unwrap reactive array nested', async () => {
    const opts = {
      template: `<div>{{a.items}}</div>`,
      setup() {
        const items = reactive([])

        setTimeout(() => {
          items.push(ref(1))
        }, 1)

        return {
          a: {
            items,
          },
        }
      },
    }
    const Constructor = Vue.extend(opts).extend({})

    const vm = new Vue(Constructor).$mount()
    expect(vm.$el.textContent).toBe('[]')
    await sleep(10)
    await nextTick()
    expect(JSON.parse(vm.$el.textContent)).toStrictEqual([{ value: 1 }])
  })

  // TODO make this pass
  // it('should work with computed', async ()=>{
  //   const opts = {
  //     template: `<div>{{len}}</div>`,
  //     setup() {
  //       const array = reactive([]);
  //       const len = computed(()=> array.length);

  //       setTimeout(() => {
  //         array.push(2)
  //       }, 1)

  //       return {
  //         len
  //       }
  //     },
  //   }
  //   const Constructor = Vue.extend(opts).extend({})

  //   const vm = new Vue(Constructor).$mount()
  //   expect(vm.$el.textContent).toBe('0')
  //   await sleep(10)
  //   await nextTick()
  //   expect(vm.$el.textContent).toBe('1')
  // })

  // #448
  it('should not cause infinite loop', async () => {
    const A = defineComponent({
      template: `<div></div>`,
      props: {
        pattern: {
          type: RegExp,
          required: true,
        },
      },

      setup(props) {
        return {
          props,
        }
      },
    })
    const B = defineComponent({
      template: `<div></div>`,
      setup(props, { emit }) {
        onMounted(() => {
          emit('ev', true)
        })

        return {}
      },
    })

    const vm = new Vue(
      defineComponent({
        components: {
          A,
          B,
        },

        template: `  <div>
      <A :pattern="/./"/>
  
      <div
        v-for="(k, v) in o.v"
        :key="v"
      >{{v}}</div>
  
      <B @ev="(v) => { o = v; }"/>
    </div>`,
        setup(props, { emit }) {
          const o = ref([false])

          return {
            o,
            emit,
          }
        },
      })
    ).$mount()

    await vm.$nextTick()

    expect(warn).not.toBeCalled()
  })
})
