import Vue from 'vue'
import { ref, h, nextTick, reactive } from 'v3/index'

// reference: https://vue-composition-api-rfc.netlify.com/api.html#template-refs

describe('api: setup() template refs', () => {
  it('string ref mount', () => {
    const el = ref(null)

    const Comp = {
      setup() {
        return {
          refKey: el
        }
      },
      render() {
        return h('div', { ref: 'refKey' })
      }
    }
    const vm = new Vue(Comp).$mount()
    expect(el.value).toBe(vm.$el)
  })

  it('string ref update', async () => {
    const fooEl = ref(null)
    const barEl = ref(null)
    const refKey = ref('foo')

    const Comp = {
      setup() {
        return {
          foo: fooEl,
          bar: barEl
        }
      },
      render() {
        return h('div', { ref: refKey.value })
      }
    }
    const vm = new Vue(Comp).$mount()
    expect(barEl.value).toBe(null)

    refKey.value = 'bar'
    await nextTick()
    expect(fooEl.value).toBe(null)
    expect(barEl.value).toBe(vm.$el)
  })

  it('string ref unmount', async () => {
    const el = ref(null)
    const toggle = ref(true)

    const Comp = {
      setup() {
        return {
          refKey: el
        }
      },
      render() {
        return toggle.value ? h('div', { ref: 'refKey' }) : null
      }
    }

    const vm = new Vue(Comp).$mount()
    expect(el.value).toBe(vm.$el)

    toggle.value = false
    await nextTick()
    expect(el.value).toBe(null)
  })

  it('function ref mount', () => {
    const fn = vi.fn()

    const Comp = {
      render: () => h('div', { ref: fn })
    }
    const vm = new Vue(Comp).$mount()
    expect(fn.mock.calls[0][0]).toBe(vm.$el)
  })

  it('function ref update', async () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const fn = ref(fn1)

    const Comp = { render: () => h('div', { ref: fn.value }) }

    const vm = new Vue(Comp).$mount()
    expect(fn1.mock.calls).toHaveLength(1)
    expect(fn1.mock.calls[0][0]).toBe(vm.$el)
    expect(fn2.mock.calls).toHaveLength(0)

    fn.value = fn2
    await nextTick()
    expect(fn1.mock.calls).toHaveLength(2)
    expect(fn1.mock.calls[1][0]).toBe(null)
    expect(fn2.mock.calls).toHaveLength(1)
    expect(fn2.mock.calls[0][0]).toBe(vm.$el)
  })

  it('function ref unmount', async () => {
    const fn = vi.fn()
    const toggle = ref(true)

    const Comp = {
      render: () => (toggle.value ? h('div', { ref: fn }) : null)
    }
    const vm = new Vue(Comp).$mount()
    expect(fn.mock.calls[0][0]).toBe(vm.$el)
    toggle.value = false
    await nextTick()
    expect(fn.mock.calls[1][0]).toBe(null)
  })

  it('render function ref mount', () => {
    const el = ref(null)

    const Comp = {
      setup() {
        return () => h('div', { ref: el })
      }
    }
    const vm = new Vue(Comp).$mount()
    expect(el.value).toBe(vm.$el)
  })

  it('render function ref update', async () => {
    const refs = {
      foo: ref(null),
      bar: ref(null)
    }
    const refKey = ref<keyof typeof refs>('foo')

    const Comp = {
      setup() {
        return () => h('div', { ref: refs[refKey.value] })
      }
    }
    const vm = new Vue(Comp).$mount()
    expect(refs.foo.value).toBe(vm.$el)
    expect(refs.bar.value).toBe(null)

    refKey.value = 'bar'
    await nextTick()
    expect(refs.foo.value).toBe(null)
    expect(refs.bar.value).toBe(vm.$el)
  })

  it('render function ref unmount', async () => {
    const el = ref(null)
    const toggle = ref(true)

    const Comp = {
      setup() {
        return () => (toggle.value ? h('div', { ref: el }) : null)
      }
    }
    const vm = new Vue(Comp).$mount()
    expect(el.value).toBe(vm.$el)

    toggle.value = false
    await nextTick()
    expect(el.value).toBe(null)
  })

  it('string ref inside slots', async () => {
    const spy = vi.fn()
    const Child = {
      render(this: any) {
        return this.$slots.default
      }
    }

    const Comp = {
      render() {
        return h(Child, [h('div', { ref: 'foo' })])
      },
      mounted(this: any) {
        spy(this.$refs.foo.tagName)
      }
    }
    new Vue(Comp).$mount()
    expect(spy).toHaveBeenCalledWith('DIV')
  })

  it('string ref inside scoped slots', async () => {
    const spy = vi.fn()
    const Child = {
      render(this: any) {
        return this.$scopedSlots.default()
      }
    }

    const Comp = {
      render() {
        return h(Child, {
          scopedSlots: {
            default: () => [h('div', { ref: 'foo' })]
          }
        })
      },
      mounted(this: any) {
        spy(this.$refs.foo.tagName)
      }
    }
    new Vue(Comp).$mount()
    expect(spy).toHaveBeenCalledWith('DIV')
  })

  it('should work with direct reactive property', () => {
    const state = reactive({
      refKey: null
    })

    const Comp = {
      setup() {
        return state
      },
      render() {
        return h('div', { ref: 'refKey' })
      }
    }
    const vm = new Vue(Comp).$mount()
    expect(state.refKey).toBe(vm.$el)
  })

  test('multiple refs', () => {
    const refKey1 = ref(null)
    const refKey2 = ref(null)
    const refKey3 = ref(null)

    const Comp = {
      setup() {
        return {
          refKey1,
          refKey2,
          refKey3
        }
      },
      render() {
        return h('div', [
          h('div', { ref: 'refKey1' }),
          h('div', { ref: 'refKey2' }),
          h('div', { ref: 'refKey3' })
        ])
      }
    }
    const vm = new Vue(Comp).$mount()
    expect(refKey1.value).toBe(vm.$el.children[0])
    expect(refKey2.value).toBe(vm.$el.children[1])
    expect(refKey3.value).toBe(vm.$el.children[2])
  })

  // vuejs/core#1505
  test('reactive template ref in the same template', async () => {
    const Comp = {
      setup() {
        const el = ref()
        return { el }
      },
      render(this: any) {
        return h(
          'div',
          { attrs: { id: 'foo' }, ref: 'el' },
          this.el && this.el.id
        )
      }
    }

    const vm = new Vue(Comp).$mount()
    // ref not ready on first render, but should queue an update immediately
    expect(vm.$el.outerHTML).toBe(`<div id="foo"></div>`)
    await nextTick()
    // ref should be updated
    expect(vm.$el.outerHTML).toBe(`<div id="foo">foo</div>`)
  })

  // vuejs/core#1834
  test('exchange refs', async () => {
    const refToggle = ref(false)
    const spy = vi.fn()

    const Comp = {
      render(this: any) {
        return h('div', [
          h('p', { ref: refToggle.value ? 'foo' : 'bar' }),
          h('i', { ref: refToggle.value ? 'bar' : 'foo' })
        ])
      },
      mounted(this: any) {
        spy(this.$refs.foo.tagName, this.$refs.bar.tagName)
      },
      updated(this: any) {
        spy(this.$refs.foo.tagName, this.$refs.bar.tagName)
      }
    }

    new Vue(Comp).$mount()

    expect(spy.mock.calls[0][0]).toBe('I')
    expect(spy.mock.calls[0][1]).toBe('P')
    refToggle.value = true
    await nextTick()
    expect(spy.mock.calls[1][0]).toBe('P')
    expect(spy.mock.calls[1][1]).toBe('I')
  })

  // vuejs/core#1789
  test('toggle the same ref to different elements', async () => {
    const refToggle = ref(false)
    const spy = vi.fn()

    const Comp = {
      render(this: any) {
        return refToggle.value ? h('p', { ref: 'foo' }) : h('i', { ref: 'foo' })
      },
      mounted(this: any) {
        spy(this.$refs.foo.tagName)
      },
      updated(this: any) {
        spy(this.$refs.foo.tagName)
      }
    }

    new Vue(Comp).$mount()

    expect(spy.mock.calls[0][0]).toBe('I')
    refToggle.value = true
    await nextTick()
    expect(spy.mock.calls[1][0]).toBe('P')
  })

  // vuejs/core#2078
  // @discrepancy Vue 2 doesn't handle merge refs
  // test('handling multiple merged refs', async () => {
  //   const Foo = {
  //     render: () => h('div', 'foo')
  //   }
  //   const Bar = {
  //     render: () => h('div', 'bar')
  //   }

  //   const viewRef = shallowRef<any>(Foo)
  //   const elRef1 = ref()
  //   const elRef2 = ref()

  //   const App = {
  //     render() {
  //       if (!viewRef.value) {
  //         return null
  //       }
  //       const view = h(viewRef.value, { ref: elRef1 })
  //       return h(view, { ref: elRef2 })
  //     }
  //   }

  //   new Vue(App).$mount()

  //   expect(elRef1.value.$el.innerHTML).toBe('foo')
  //   expect(elRef1.value).toBe(elRef2.value)

  //   viewRef.value = Bar
  //   await nextTick()
  //   expect(elRef1.value.$el.innerHTML).toBe('bar')
  //   expect(elRef1.value).toBe(elRef2.value)

  //   viewRef.value = null
  //   await nextTick()
  //   expect(elRef1.value).toBeNull()
  //   expect(elRef1.value).toBe(elRef2.value)
  // })

  // Vue 2 doesn't have inline mode
  // test('raw ref with ref_key', () => {
  //   let refs: any

  //   const el = ref()

  //   const App = {
  //     mounted() {
  //       refs = (this as any).$refs
  //     },
  //     render() {
  //       return h(
  //         'div',
  //         {
  //           ref: el,
  //           ref_key: 'el'
  //         },
  //         'hello'
  //       )
  //     }
  //   }

  //   new Vue(App).$mount()

  //   expect(el.value.innerHTML).toBe('hello')
  //   expect(refs.el.innerHTML).toBe('hello')
  // })

  // compiled output of v-for + template ref
  test('ref in v-for', async () => {
    const show = ref(true)
    const state = reactive({ list: [1, 2, 3] })
    const listRefs = ref<any[]>([])
    const mapRefs = () => listRefs.value.map(n => n.innerHTML)

    const App = {
      render() {
        return show.value
          ? h(
              'ul',
              state.list.map(i =>
                h(
                  'li',
                  {
                    ref: listRefs,
                    refInFor: true
                  },
                  i
                )
              )
            )
          : null
      }
    }

    new Vue(App).$mount()

    expect(mapRefs()).toMatchObject(['1', '2', '3'])

    state.list.push(4)
    await nextTick()
    expect(mapRefs()).toMatchObject(['1', '2', '3', '4'])

    state.list.shift()
    await nextTick()
    expect(mapRefs()).toMatchObject(['2', '3', '4'])

    show.value = !show.value
    await nextTick()

    expect(mapRefs()).toMatchObject([])

    show.value = !show.value
    await nextTick()
    expect(mapRefs()).toMatchObject(['2', '3', '4'])
  })

  test('named ref in v-for', async () => {
    const show = ref(true)
    const state = reactive({ list: [1, 2, 3] })
    const listRefs = ref([])
    const mapRefs = () => listRefs.value.map((n: HTMLElement) => n.innerHTML)

    const App = {
      setup() {
        return { listRefs }
      },
      render() {
        return show.value
          ? h(
              'ul',
              state.list.map(i =>
                h(
                  'li',
                  {
                    ref: 'listRefs',
                    refInFor: true
                  },
                  i
                )
              )
            )
          : null
      }
    }

    new Vue(App).$mount()

    expect(mapRefs()).toMatchObject(['1', '2', '3'])

    state.list.push(4)
    await nextTick()
    expect(mapRefs()).toMatchObject(['1', '2', '3', '4'])

    state.list.shift()
    await nextTick()
    expect(mapRefs()).toMatchObject(['2', '3', '4'])

    show.value = !show.value
    await nextTick()

    expect(mapRefs()).toMatchObject([])

    show.value = !show.value
    await nextTick()
    expect(mapRefs()).toMatchObject(['2', '3', '4'])
  })
})
