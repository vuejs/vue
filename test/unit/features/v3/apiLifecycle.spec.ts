import Vue from 'vue'
import {
  h,
  onBeforeMount,
  onMounted,
  ref,
  reactive,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onRenderTracked,
  onRenderTriggered,
  DebuggerEvent,
  TrackOpTypes,
  TriggerOpTypes
} from 'v3'
import { nextTick } from 'core/util'

describe('api: lifecycle hooks', () => {
  it('onBeforeMount', () => {
    const fn = vi.fn(() => {
      // should be called before root is replaced
      expect(vm.$el).toBeUndefined()
    })

    const Comp = {
      setup() {
        onBeforeMount(fn)
        return () => h('div', 'hello')
      }
    }
    const vm = new Vue(Comp)
    vm.$mount()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(vm.$el.innerHTML).toBe(`hello`)
  })

  it('onMounted', () => {
    const fn = vi.fn(() => {
      // should be called after inner div is rendered
      expect(vm.$el.outerHTML).toBe(`<div></div>`)
    })

    const Comp = {
      setup() {
        onMounted(fn)
        return () => h('div')
      }
    }
    const vm = new Vue(Comp)
    vm.$mount()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('onBeforeUpdate', async () => {
    const count = ref(0)
    const fn = vi.fn(() => {
      // should be called before inner div is updated
      expect(vm.$el.outerHTML).toBe(`<div>0</div>`)
    })

    const Comp = {
      setup() {
        onBeforeUpdate(fn)
        return () => h('div', count.value)
      }
    }
    const vm = new Vue(Comp).$mount()

    count.value++
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(vm.$el.outerHTML).toBe(`<div>1</div>`)
  })

  it('state mutation in onBeforeUpdate', async () => {
    const count = ref(0)
    const fn = vi.fn(() => {
      // should be called before inner div is updated
      expect(vm.$el.outerHTML).toBe(`<div>0</div>`)
      count.value++
    })
    const renderSpy = vi.fn()

    const Comp = {
      setup() {
        onBeforeUpdate(fn)
        return () => {
          renderSpy()
          return h('div', count.value)
        }
      }
    }
    const vm = new Vue(Comp).$mount()
    expect(renderSpy).toHaveBeenCalledTimes(1)

    count.value++
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(renderSpy).toHaveBeenCalledTimes(2)
    expect(vm.$el.outerHTML).toBe(`<div>2</div>`)
  })

  it('onUpdated', async () => {
    const count = ref(0)
    const fn = vi.fn(() => {
      // should be called after inner div is updated
      expect(vm.$el.outerHTML).toBe(`<div>1</div>`)
    })

    const Comp = {
      setup() {
        onUpdated(fn)
        return () => h('div', count.value)
      }
    }
    const vm = new Vue(Comp).$mount()

    count.value++
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('onBeforeUnmount', async () => {
    const toggle = ref(true)
    const root = document.createElement('div')
    const fn = vi.fn(() => {
      // should be called before inner div is removed
      expect(root.outerHTML).toBe(`<div></div>`)
    })

    const Comp = {
      setup() {
        return () => (toggle.value ? h(Child) : null)
      }
    }

    const Child = {
      setup() {
        onBeforeUnmount(fn)
        return () => h('div')
      }
    }

    new Vue(Comp).$mount(root)

    toggle.value = false
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('onUnmounted', async () => {
    const toggle = ref(true)
    const fn = vi.fn(() => {
      // @discrepancy should be called after inner div is removed
      // expect(vm.$el.outerHTML).toBe(`<span></span>`)
    })

    const Comp = {
      setup() {
        return () => (toggle.value ? h(Child) : h('span'))
      }
    }

    const Child = {
      setup() {
        onUnmounted(fn)
        return () => h('div')
      }
    }

    new Vue(Comp).$mount()

    toggle.value = false
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('onBeforeUnmount in onMounted', async () => {
    const toggle = ref(true)
    const fn = vi.fn(() => {
      // should be called before inner div is removed
      expect(vm.$el.outerHTML).toBe(`<div></div>`)
    })

    const Comp = {
      setup() {
        return () => (toggle.value ? h(Child) : null)
      }
    }

    const Child = {
      setup() {
        onMounted(() => {
          onBeforeUnmount(fn)
        })
        return () => h('div')
      }
    }

    const vm = new Vue(Comp).$mount()

    toggle.value = false
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('lifecycle call order', async () => {
    const count = ref(0)
    const calls: string[] = []

    const Root = {
      setup() {
        onBeforeMount(() => calls.push('root onBeforeMount'))
        onMounted(() => calls.push('root onMounted'))
        onBeforeUpdate(() => calls.push('root onBeforeUpdate'))
        onUpdated(() => calls.push('root onUpdated'))
        onBeforeUnmount(() => calls.push('root onBeforeUnmount'))
        onUnmounted(() => calls.push('root onUnmounted'))
        return () => h(Mid, { props: { count: count.value } })
      }
    }

    const Mid = {
      props: ['count'],
      setup(props: any) {
        onBeforeMount(() => calls.push('mid onBeforeMount'))
        onMounted(() => calls.push('mid onMounted'))
        onBeforeUpdate(() => calls.push('mid onBeforeUpdate'))
        onUpdated(() => calls.push('mid onUpdated'))
        onBeforeUnmount(() => calls.push('mid onBeforeUnmount'))
        onUnmounted(() => calls.push('mid onUnmounted'))
        return () => h(Child, { props: { count: props.count } })
      }
    }

    const Child = {
      props: ['count'],
      setup(props: any) {
        onBeforeMount(() => calls.push('child onBeforeMount'))
        onMounted(() => calls.push('child onMounted'))
        onBeforeUpdate(() => calls.push('child onBeforeUpdate'))
        onUpdated(() => calls.push('child onUpdated'))
        onBeforeUnmount(() => calls.push('child onBeforeUnmount'))
        onUnmounted(() => calls.push('child onUnmounted'))
        return () => h('div', props.count)
      }
    }

    // mount
    const vm = new Vue(Root)
    vm.$mount()
    expect(calls).toEqual([
      'root onBeforeMount',
      'mid onBeforeMount',
      'child onBeforeMount',
      'child onMounted',
      'mid onMounted',
      'root onMounted'
    ])

    calls.length = 0

    // update
    count.value++
    await nextTick()
    expect(calls).toEqual([
      'root onBeforeUpdate',
      'mid onBeforeUpdate',
      'child onBeforeUpdate',
      'child onUpdated',
      'mid onUpdated',
      'root onUpdated'
    ])

    calls.length = 0

    // unmount
    vm.$destroy()
    expect(calls).toEqual([
      'root onBeforeUnmount',
      'mid onBeforeUnmount',
      'child onBeforeUnmount',
      'child onUnmounted',
      'mid onUnmounted',
      'root onUnmounted'
    ])
  })

  it('onRenderTracked', () => {
    const events: DebuggerEvent[] = []
    const onTrack = vi.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1, bar: 2 })

    const Comp = {
      setup() {
        onRenderTracked(onTrack)
        return () => h('div', [obj.foo + obj.bar])
      }
    }

    new Vue(Comp).$mount()
    expect(onTrack).toHaveBeenCalledTimes(2)
    expect(events).toMatchObject([
      {
        target: obj,
        type: TrackOpTypes.GET,
        key: 'foo'
      },
      {
        target: obj,
        type: TrackOpTypes.GET,
        key: 'bar'
      }
    ])
  })

  it('onRenderTriggered', async () => {
    const events: DebuggerEvent[] = []
    const onTrigger = vi.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive<{
      foo: number
      bar: number
    }>({ foo: 1, bar: 2 })

    const Comp = {
      setup() {
        onRenderTriggered(onTrigger)
        return () => h('div', [obj.foo + obj.bar])
      }
    }

    new Vue(Comp).$mount()

    obj.foo++
    await nextTick()
    expect(onTrigger).toHaveBeenCalledTimes(1)
    expect(events[0]).toMatchObject({
      type: TriggerOpTypes.SET,
      key: 'foo',
      oldValue: 1,
      newValue: 2
    })

    obj.bar++
    await nextTick()
    expect(onTrigger).toHaveBeenCalledTimes(2)
    expect(events[1]).toMatchObject({
      type: TriggerOpTypes.SET,
      key: 'bar',
      oldValue: 2,
      newValue: 3
    })
  })
})
