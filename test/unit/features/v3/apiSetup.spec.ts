import { h, ref, reactive, isReactive, toRef, isRef } from 'v3'
import { nextTick } from 'core/util'
import { effect } from 'v3/reactivity/effect'
import Vue from 'vue'

function renderToString(comp: any) {
  const vm = new Vue(comp).$mount()
  return vm.$el.outerHTML
}

describe('api: setup context', () => {
  it('should expose return values to template render context', () => {
    const Comp = {
      setup() {
        return {
          // ref should auto-unwrap
          ref: ref('foo'),
          // object exposed as-is
          object: reactive({ msg: 'bar' }),
          // primitive value exposed as-is
          value: 'baz'
        }
      },
      render() {
        return h('div', `${this.ref} ${this.object.msg} ${this.value}`)
      }
    }
    expect(renderToString(Comp)).toMatch(`<div>foo bar baz</div>`)
  })

  it('should support returning render function', () => {
    const Comp = {
      setup() {
        return () => {
          return h('div', 'hello')
        }
      }
    }
    expect(renderToString(Comp)).toMatch(`<div>hello</div>`)
  })

  it('props', async () => {
    const count = ref(0)
    let dummy

    const Parent = {
      render: () => h(Child, { props: { count: count.value } })
    }

    const Child = {
      props: { count: Number },
      setup(props) {
        effect(() => {
          dummy = props.count
        })
        return () => h('div', props.count)
      }
    }

    const vm = new Vue(Parent).$mount()
    expect(vm.$el.outerHTML).toMatch(`<div>0</div>`)
    expect(dummy).toBe(0)

    // props should be reactive
    count.value++
    await nextTick()
    expect(vm.$el.outerHTML).toMatch(`<div>1</div>`)
    expect(dummy).toBe(1)
  })

  it('context.attrs', async () => {
    const toggle = ref(true)

    const Parent = {
      render: () =>
        h(Child, { attrs: toggle.value ? { id: 'foo' } : { class: 'baz' } })
    }

    const Child = {
      // explicit empty props declaration
      // puts everything received in attrs
      // disable implicit fallthrough
      inheritAttrs: false,
      setup(_props: any, { attrs }: any) {
        return () => h('div', { attrs })
      }
    }

    const vm = new Vue(Parent).$mount()
    expect(vm.$el.outerHTML).toMatch(`<div id="foo"></div>`)

    // should update even though it's not reactive
    toggle.value = false
    await nextTick()
    expect(vm.$el.outerHTML).toMatch(`<div class="baz"></div>`)
  })

  // vuejs/core #4161
  it('context.attrs in child component slots', async () => {
    const toggle = ref(true)

    const Wrapper = {
      template: `<div><slot/></div>`
    }

    const Child = {
      inheritAttrs: false,
      setup(_: any, { attrs }: any) {
        return () => {
          return h(Wrapper, [h('div', { attrs })])
        }
      }
    }

    const Parent = {
      render: () =>
        h(Child, { attrs: toggle.value ? { id: 'foo' } : { class: 'baz' } })
    }

    const vm = new Vue(Parent).$mount()
    expect(vm.$el.outerHTML).toMatch(`<div id="foo"></div>`)

    // should update even though it's not reactive
    toggle.value = false
    await nextTick()
    expect(vm.$el.outerHTML).toMatch(`<div class="baz"></div>`)
  })

  it('context.attrs in child component scoped slots', async () => {
    const toggle = ref(true)

    const Wrapper = {
      template: `<div><slot/></div>`
    }

    const Child = {
      inheritAttrs: false,
      setup(_: any, { attrs }: any) {
        return () => {
          return h(Wrapper, {
            scopedSlots: {
              default: () => h('div', { attrs })
            }
          })
        }
      }
    }

    const Parent = {
      render: () =>
        h(Child, { attrs: toggle.value ? { id: 'foo' } : { class: 'baz' } })
    }

    const vm = new Vue(Parent).$mount()
    expect(vm.$el.outerHTML).toMatch(`<div id="foo"></div>`)

    // should update even though it's not reactive
    toggle.value = false
    await nextTick()
    expect(vm.$el.outerHTML).toMatch(`<div class="baz"></div>`)
  })

  it('context.slots', async () => {
    const id = ref('foo')

    const Child = {
      setup(_props: any, { slots }: any) {
        return () => h('div', [...slots.foo(), ...slots.bar()])
      }
    }

    const Parent = {
      components: { Child },
      setup() {
        return { id }
      },
      template: `<Child>
        <template #foo>{{ id }}</template>
        <template #bar>bar</template>
      </Child>`
    }

    const vm = new Vue(Parent).$mount()
    expect(vm.$el.outerHTML).toMatch(`<div>foobar</div>`)

    // should update even though it's not reactive
    id.value = 'baz'
    await nextTick()
    expect(vm.$el.outerHTML).toMatch(`<div>bazbar</div>`)
  })

  it('context.emit', async () => {
    const count = ref(0)
    const spy = vi.fn()

    const Child = {
      props: {
        count: {
          type: Number,
          default: 1
        }
      },
      setup(props, { emit }) {
        return () =>
          h(
            'div',
            {
              on: { click: () => emit('inc', props.count + 1) }
            },
            props.count
          )
      }
    }

    const Parent = {
      components: { Child },
      setup: () => ({
        count,
        onInc(newVal: number) {
          spy()
          count.value = newVal
        }
      }),
      template: `<Child :count="count" @inc="onInc" />`
    }

    const vm = new Vue(Parent).$mount()
    expect(vm.$el.outerHTML).toMatch(`<div>0</div>`)

    // emit should trigger parent handler
    triggerEvent(vm.$el as HTMLElement, 'click')
    expect(spy).toHaveBeenCalled()
    await nextTick()
    expect(vm.$el.outerHTML).toMatch(`<div>1</div>`)
  })

  it('directive resolution', () => {
    const spy = vi.fn()
    new Vue({
      setup: () => ({
        __sfc: true,
        vDir: {
          inserted: spy
        }
      }),
      template: `<div v-dir />`
    }).$mount()
    expect(spy).toHaveBeenCalled()
  })

  // #12561
  it('setup props should be reactive', () => {
    const msg = ref('hi')

    const Child = {
      props: ['msg'],
      setup: props => {
        expect(isReactive(props)).toBe(true)
        expect(isRef(toRef(props, 'foo'))).toBe(true)
        return () => {}
      }
    }

    new Vue({
      setup() {
        return h => h(Child, { props: { msg } })
      }
    }).$mount()
  })

  it('should not track dep accessed in setup', async () => {
    const spy = vi.fn()
    const msg = ref('hi')

    const Child = {
      setup: () => {
        msg.value
        return () => {}
      }
    }

    new Vue({
      setup() {
        return h => {
          spy()
          return h(Child)
        }
      }
    }).$mount()

    expect(spy).toHaveBeenCalledTimes(1)

    msg.value = 'bye'
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
