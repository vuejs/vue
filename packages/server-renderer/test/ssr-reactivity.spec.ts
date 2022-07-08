// @vitest-environment node

import Vue from 'vue'
import {
  reactive,
  ref,
  isReactive,
  shallowRef,
  isRef,
  set,
  nextTick,
  getCurrentInstance
} from 'v3'
import { createRenderer } from '../src'

describe('SSR Reactive', () => {
  beforeEach(() => {
    // force SSR env
    global.process.env.VUE_ENV = 'server'
  })

  it('should not affect non reactive APIs', () => {
    expect(typeof window).toBe('undefined')
    expect((Vue.observable({}) as any).__ob__).toBeUndefined()
  })

  it('reactive behavior should be consistent in SSR', () => {
    const obj = reactive({
      foo: ref(1),
      bar: {
        baz: ref(2)
      },
      arr: [{ foo: ref(3) }]
    })
    expect(isReactive(obj)).toBe(true)
    expect(obj.foo).toBe(1)

    expect(isReactive(obj.bar)).toBe(true)
    expect(obj.bar.baz).toBe(2)

    expect(isReactive(obj.arr)).toBe(true)
    expect(isReactive(obj.arr[0])).toBe(true)
    expect(obj.arr[0].foo).toBe(3)
  })

  it('ref value', () => {
    const r = ref({})
    expect(isReactive(r.value)).toBe(true)
  })

  it('should render', async () => {
    const app = new Vue({
      setup() {
        return {
          count: ref(42)
        }
      },
      render(this: any, h) {
        return h('div', this.count)
      }
    })

    const serverRenderer = createRenderer()
    const html = await serverRenderer.renderToString(app)
    expect(html).toBe('<div data-server-rendered="true">42</div>')
  })

  it('reactive + isReactive', () => {
    const state = reactive({})
    expect(isReactive(state)).toBe(true)
  })

  it('shallowRef + isRef', () => {
    const state = shallowRef({})
    expect(isRef(state)).toBe(true)
  })

  it('should work on objects sets with set()', () => {
    const state = ref<any>({})

    set(state.value, 'a', {})
    expect(isReactive(state.value.a)).toBe(true)

    set(state.value, 'a', {})
    expect(isReactive(state.value.a)).toBe(true)
  })

  it('should work on arrays sets with set()', () => {
    const state = ref<any>([])

    set(state.value, 1, {})
    expect(isReactive(state.value[1])).toBe(true)

    set(state.value, 1, {})
    expect(isReactive(state.value[1])).toBe(true)

    const rawArr = []
    set(rawArr, 1, {})
    expect(isReactive(rawArr[1])).toBe(false)
  })

  // #550
  it('props should work with set', async done => {
    let props: any

    const app = new Vue({
      render(this: any, h) {
        return h('child', { attrs: { msg: this.msg } })
      },
      setup() {
        return { msg: ref('hello') }
      },
      components: {
        child: {
          render(this: any, h: any) {
            return h('span', this.data.msg)
          },
          props: ['msg'],
          setup(_props) {
            props = _props

            return { data: _props }
          }
        }
      }
    })

    const serverRenderer = createRenderer()
    const html = await serverRenderer.renderToString(app)

    expect(html).toBe('<span data-server-rendered="true">hello</span>')

    expect(props.bar).toBeUndefined()
    set(props, 'bar', 'bar')
    expect(props.bar).toBe('bar')

    done()
  })

  // #721
  it('should behave correctly', () => {
    const state = ref({ old: ref(false) })
    set(state.value, 'new', ref(true))
    // console.log(process.server, 'state.value', JSON.stringify(state.value))

    expect(state.value).toMatchObject({
      old: false,
      new: true
    })
  })

  // #721
  it('should behave correctly for the nested ref in the object', () => {
    const state = { old: ref(false) }
    set(state, 'new', ref(true))
    expect(JSON.stringify(state)).toBe(
      '{"old":{"value":false},"new":{"value":true}}'
    )
  })

  // #721
  it('should behave correctly for ref of object', () => {
    const state = ref({ old: ref(false) })
    set(state.value, 'new', ref(true))
    expect(JSON.stringify(state.value)).toBe('{"old":false,"new":true}')
  })

  it('ssr should not RangeError: Maximum call stack size exceeded', async () => {
    new Vue({
      setup() {
        // @ts-expect-error
        const app = getCurrentInstance().proxy
        let mockNt: any = []
        mockNt.__ob__ = {}
        const test = reactive({
          app,
          mockNt
        })
        return {
          test
        }
      }
    })
    await nextTick()
    expect(
      `"RangeError: Maximum call stack size exceeded"`
    ).not.toHaveBeenWarned()
  })

  it('should work on objects sets with set()', () => {
    const state = ref<any>({})
    set(state.value, 'a', {})

    expect(isReactive(state.value.a)).toBe(true)
  })
})
