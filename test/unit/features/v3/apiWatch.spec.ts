import Vue from 'vue'
import {
  watch,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  reactive,
  computed,
  ref,
  triggerRef,
  shallowRef,
  h,
  onMounted,
  getCurrentInstance,
  effectScope,
  TrackOpTypes,
  TriggerOpTypes,
  DebuggerEvent
} from 'v3'
import { nextTick } from 'core/util'
import { set } from 'core/observer'
import { Component } from 'types/component'

// reference: https://vue-composition-api-rfc.netlify.com/api.html#watch

describe('api: watch', () => {
  it('effect', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('watching single source: getter', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watch(
      () => state.count,
      (count, prevCount) => {
        dummy = [count, prevCount]
        // assert types
        count + 1
        if (prevCount) {
          prevCount + 1
        }
      }
    )
    state.count++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  it('watching single source: ref', async () => {
    const count = ref(0)
    let dummy
    watch(count, (count, prevCount) => {
      dummy = [count, prevCount]
      // assert types
      count + 1
      if (prevCount) {
        prevCount + 1
      }
    })
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  it('watching single source: array', async () => {
    const array = reactive({ a: [] as number[] }).a
    const spy = vi.fn()
    watch(array, spy)
    array.push(1)
    await nextTick()
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith([1], expect.anything(), expect.anything())
  })

  it('should not fire if watched getter result did not change', async () => {
    const spy = vi.fn()
    const n = ref(0)
    watch(() => n.value % 2, spy)

    n.value++
    await nextTick()
    expect(spy).toBeCalledTimes(1)

    n.value += 2
    await nextTick()
    // should not be called again because getter result did not change
    expect(spy).toBeCalledTimes(1)
  })

  it('watching single source: computed ref', async () => {
    const count = ref(0)
    const plus = computed(() => count.value + 1)
    let dummy
    watch(plus, (count, prevCount) => {
      dummy = [count, prevCount]
      // assert types
      count + 1
      if (prevCount) {
        prevCount + 1
      }
    })
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([2, 1])
  })

  it('watching primitive with deep: true', async () => {
    const count = ref(0)
    let dummy
    watch(
      count,
      (c, prevCount) => {
        dummy = [c, prevCount]
      },
      {
        deep: true
      }
    )
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  it('directly watching reactive object (with automatic deep: true)', async () => {
    const src = reactive({
      count: 0
    })
    let dummy
    watch(src, ({ count }) => {
      dummy = count
    })
    src.count++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('deep watch w/ raw refs', async () => {
    const count = ref(0)
    const src = reactive({
      arr: [count]
    })
    let dummy
    watch(src, ({ arr: [{ value }] }) => {
      dummy = value
    })
    count.value++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('watching multiple sources', async () => {
    const state = reactive({ count: 1 })
    const count = ref(1)
    const plus = computed(() => count.value + 1)

    let dummy
    watch([() => state.count, count, plus], (vals, oldVals) => {
      dummy = [vals, oldVals]
      // assert types
      vals.concat(1)
      oldVals.concat(1)
    })

    state.count++
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([
      [2, 2, 3],
      [1, 1, 2]
    ])
  })

  it('watching multiple sources: readonly array', async () => {
    const state = reactive({ count: 1 })
    const status = ref(false)

    let dummy
    watch([() => state.count, status] as const, (vals, oldVals) => {
      dummy = [vals, oldVals]
      const [count] = vals
      const [, oldStatus] = oldVals
      // assert types
      count + 1
      oldStatus === true
    })

    state.count++
    status.value = true
    await nextTick()
    expect(dummy).toMatchObject([
      [2, true],
      [1, false]
    ])
  })

  it('watching multiple sources: reactive object (with automatic deep: true)', async () => {
    const src = reactive({ count: 0 })
    let dummy
    watch([src], ([state]) => {
      dummy = state
      // assert types
      state.count === 1
    })
    src.count++
    await nextTick()
    expect(dummy).toMatchObject({ count: 1 })
  })

  it('warn invalid watch source', () => {
    // @ts-expect-error
    watch(1, () => {})
    expect(`Invalid watch source`).toHaveBeenWarned()
  })

  it('warn invalid watch source: multiple sources', () => {
    watch([1], () => {})
    expect(`Invalid watch source`).toHaveBeenWarned()
  })

  it('stopping the watcher (effect)', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const stop = watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    stop()
    state.count++
    await nextTick()
    // should not update
    expect(dummy).toBe(0)
  })

  it('stopping the watcher (with source)', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const stop = watch(
      () => state.count,
      count => {
        dummy = count
      }
    )

    state.count++
    await nextTick()
    expect(dummy).toBe(1)

    stop()
    state.count++
    await nextTick()
    // should not update
    expect(dummy).toBe(1)
  })

  it('cleanup registration (effect)', async () => {
    const state = reactive({ count: 0 })
    const cleanup = vi.fn()
    let dummy
    const stop = watchEffect(onCleanup => {
      onCleanup(cleanup)
      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  it('cleanup registration (with source)', async () => {
    const count = ref(0)
    const cleanup = vi.fn()
    let dummy
    const stop = watch(count, (count, prevCount, onCleanup) => {
      onCleanup(cleanup)
      dummy = count
    })

    count.value++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(0)
    expect(dummy).toBe(1)

    count.value++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(2)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  it('flush timing: pre (default)', async () => {
    const count = ref(0)
    const count2 = ref(0)

    let callCount = 0
    let result1
    let result2
    const assertion = vi.fn((count, count2Value) => {
      callCount++
      // on mount, the watcher callback should be called before DOM render
      // on update, should be called before the count is updated
      const expectedDOM =
        callCount === 1 ? `<div></div>` : `<div>${count - 1}</div>`
      result1 = container.innerHTML === expectedDOM

      // in a pre-flush callback, all state should have been updated
      const expectedState = callCount - 1
      result2 = count === expectedState && count2Value === expectedState
    })

    const Comp = {
      setup() {
        watchEffect(() => {
          assertion(count.value, count2.value)
        })
        return () => h('div', count.value)
      }
    }
    const container = document.createElement('div')
    const root = document.createElement('div')
    container.appendChild(root)
    new Vue(Comp).$mount(root)
    expect(assertion).toHaveBeenCalledTimes(1)
    expect(result1).toBe(true)
    expect(result2).toBe(true)

    count.value++
    count2.value++
    await nextTick()
    // two mutations should result in 1 callback execution
    expect(assertion).toHaveBeenCalledTimes(2)
    expect(result1).toBe(true)
    expect(result2).toBe(true)
  })

  // #12569
  it('flush:pre watcher triggered before component mount (in child components)', () => {
    const count = ref(0)
    const spy = vi.fn()
    const Comp = {
      setup() {
        watch(count, spy)
        count.value++
        return h => h('div')
      }
    }
    new Vue({
      render: h => h(Comp)
    }).$mount()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('flush timing: post', async () => {
    const count = ref(0)
    let result
    const assertion = vi.fn(count => {
      result = container.innerHTML === `<div>${count}</div>`
    })

    const Comp = {
      setup() {
        watchEffect(
          () => {
            assertion(count.value)
          },
          { flush: 'post' }
        )
        return () => h('div', count.value)
      }
    }
    const container = document.createElement('div')
    const root = document.createElement('div')
    container.appendChild(root)
    new Vue(Comp).$mount(root)
    expect(assertion).toHaveBeenCalledTimes(1)
    expect(result).toBe(true)

    count.value++
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(2)
    expect(result).toBe(true)
  })

  it('watchPostEffect', async () => {
    const count = ref(0)
    let result
    const assertion = vi.fn(count => {
      result = container.innerHTML === `<div>${count}</div>`
    })

    const Comp = {
      setup() {
        watchPostEffect(() => {
          assertion(count.value)
        })
        return () => h('div', count.value)
      }
    }
    const container = document.createElement('div')
    const root = document.createElement('div')
    container.appendChild(root)
    new Vue(Comp).$mount(root)
    expect(assertion).toHaveBeenCalledTimes(1)
    expect(result).toBe(true)

    count.value++
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(2)
    expect(result).toBe(true)
  })

  it('flush timing: sync', async () => {
    const count = ref(0)
    const count2 = ref(0)

    let callCount = 0
    let result1
    let result2
    const assertion = vi.fn(count => {
      callCount++
      // on mount, the watcher callback should be called before DOM render
      // on update, should be called before the count is updated
      const expectedDOM =
        callCount === 1 ? `<div></div>` : `<div>${count - 1}</div>`
      result1 = container.innerHTML === expectedDOM

      // in a sync callback, state mutation on the next line should not have
      // executed yet on the 2nd call, but will be on the 3rd call.
      const expectedState = callCount < 3 ? 0 : 1
      result2 = count2.value === expectedState
    })

    const Comp = {
      setup() {
        watchEffect(
          () => {
            assertion(count.value)
          },
          {
            flush: 'sync'
          }
        )
        return () => h('div', count.value)
      }
    }
    const container = document.createElement('div')
    const root = document.createElement('div')
    container.appendChild(root)
    new Vue(Comp).$mount(root)
    expect(assertion).toHaveBeenCalledTimes(1)
    expect(result1).toBe(true)
    expect(result2).toBe(true)

    count.value++
    count2.value++
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(3)
    expect(result1).toBe(true)
    expect(result2).toBe(true)
  })

  it('watchSyncEffect', async () => {
    const count = ref(0)
    const count2 = ref(0)

    let callCount = 0
    let result1
    let result2
    const assertion = vi.fn(count => {
      callCount++
      // on mount, the watcher callback should be called before DOM render
      // on update, should be called before the count is updated
      const expectedDOM =
        callCount === 1 ? `<div></div>` : `<div>${count - 1}</div>`
      result1 = container.innerHTML === expectedDOM

      // in a sync callback, state mutation on the next line should not have
      // executed yet on the 2nd call, but will be on the 3rd call.
      const expectedState = callCount < 3 ? 0 : 1
      result2 = count2.value === expectedState
    })

    const Comp = {
      setup() {
        watchSyncEffect(() => {
          assertion(count.value)
        })
        return () => h('div', count.value)
      }
    }
    const container = document.createElement('div')
    const root = document.createElement('div')
    container.appendChild(root)
    new Vue(Comp).$mount(root)
    expect(assertion).toHaveBeenCalledTimes(1)
    expect(result1).toBe(true)
    expect(result2).toBe(true)

    count.value++
    count2.value++
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(3)
    expect(result1).toBe(true)
    expect(result2).toBe(true)
  })

  it('should not fire on component unmount w/ flush: post', async () => {
    const toggle = ref(true)
    const cb = vi.fn()
    const Comp = {
      setup() {
        watch(toggle, cb, { flush: 'post' })
      },
      render() {}
    }
    const App = {
      render() {
        return toggle.value ? h(Comp) : null
      }
    }
    new Vue(App).$mount()
    expect(cb).not.toHaveBeenCalled()
    toggle.value = false
    await nextTick()
    expect(cb).not.toHaveBeenCalled()
  })

  it('should not fire on component unmount w/ flush: pre', async () => {
    const toggle = ref(true)
    const cb = vi.fn()
    const Comp = {
      setup() {
        watch(toggle, cb, { flush: 'pre' })
      },
      render() {}
    }
    const App = {
      render() {
        return toggle.value ? h(Comp) : null
      }
    }
    new Vue(App).$mount()
    expect(cb).not.toHaveBeenCalled()
    toggle.value = false
    await nextTick()
    expect(cb).not.toHaveBeenCalled()
  })

  // vuejs/core#1763
  it('flush: pre watcher watching props should fire before child update', async () => {
    const a = ref(0)
    const b = ref(0)
    const c = ref(0)
    const calls: string[] = []

    const Comp = {
      props: ['a', 'b'],
      setup(props: any) {
        watch(
          () => props.a + props.b,
          () => {
            calls.push('watcher 1')
            c.value++
          },
          { flush: 'pre' }
        )

        // vuejs/core#1777 chained pre-watcher
        watch(
          c,
          () => {
            calls.push('watcher 2')
          },
          { flush: 'pre' }
        )
        return () => {
          c.value
          calls.push('render')
        }
      }
    }

    const App = {
      render() {
        return h(Comp, { props: { a: a.value, b: b.value } })
      }
    }

    new Vue(App).$mount()
    expect(calls).toEqual(['render'])

    // both props are updated
    // should trigger pre-flush watcher first and only once
    // then trigger child render
    a.value++
    b.value++
    await nextTick()
    expect(calls).toEqual(['render', 'watcher 1', 'watcher 2', 'render'])
  })

  // vuejs/core#5721
  it('flush: pre triggered in component setup should be buffered and called before mounted', () => {
    const count = ref(0)
    const calls: string[] = []
    const App = {
      render() {},
      setup() {
        watch(
          count,
          () => {
            calls.push('watch ' + count.value)
          },
          { flush: 'pre' }
        )
        onMounted(() => {
          calls.push('mounted')
        })
        // mutate multiple times
        count.value++
        count.value++
        count.value++
      }
    }
    new Vue(App).$mount()
    expect(calls).toMatchObject(['watch 3', 'mounted'])
  })

  // vuejs/core#1852
  it('flush: post watcher should fire after template refs updated', async () => {
    const toggle = ref(false)
    let dom: HTMLElement | null = null

    const App = {
      setup() {
        const domRef = ref<any>(null)

        watch(
          toggle,
          () => {
            dom = domRef.value
          },
          { flush: 'post' }
        )

        return () => {
          return toggle.value ? h('p', { ref: domRef }) : null
        }
      }
    }

    new Vue(App).$mount()
    expect(dom).toBe(null)

    toggle.value = true
    await nextTick()
    expect(dom!.tagName).toBe('P')
  })

  it('deep', async () => {
    const state = reactive({
      nested: {
        count: ref(0)
      },
      array: [1, 2, 3]
      // map: new Map([
      //   ['a', 1],
      //   ['b', 2]
      // ]),
      // set: new Set([1, 2, 3])
    })

    let dummy
    watch(
      () => state,
      state => {
        dummy = [
          state.nested.count,
          state.array[0]
          // state.map.get('a'),
          // state.set.has(1)
        ]
      },
      { deep: true }
    )

    state.nested.count++
    await nextTick()
    expect(dummy).toEqual([1, 1])

    // nested array mutation
    set(state.array, 0, 2)
    await nextTick()
    expect(dummy).toEqual([1, 2])

    // nested map mutation
    // state.map.set('a', 2)
    // await nextTick()
    // expect(dummy).toEqual([1, 2, 2, true])

    // nested set mutation
    // state.set.delete(1)
    // await nextTick()
    // expect(dummy).toEqual([1, 2, 2, false])
  })

  it('watching deep ref', async () => {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    const state = reactive({ count, double })

    let dummy
    watch(
      () => state,
      state => {
        dummy = [state.count, state.double]
      },
      { deep: true }
    )

    count.value++
    await nextTick()
    expect(dummy).toEqual([1, 2])
  })

  it('immediate', async () => {
    const count = ref(0)
    const cb = vi.fn()
    watch(count, cb, { immediate: true })
    expect(cb).toHaveBeenCalledTimes(1)
    count.value++
    await nextTick()
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it('immediate: triggers when initial value is null', async () => {
    const state = ref(null)
    const spy = vi.fn()
    watch(() => state.value, spy, { immediate: true })
    expect(spy).toHaveBeenCalled()
  })

  it('immediate: triggers when initial value is undefined', async () => {
    const state = ref()
    const spy = vi.fn()
    watch(() => state.value, spy, { immediate: true })
    expect(spy).toHaveBeenCalled()
    state.value = 3
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(2)
    // testing if undefined can trigger the watcher
    state.value = undefined
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(3)
    // it shouldn't trigger if the same value is set
    state.value = undefined
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('warn immediate option when using effect', async () => {
    const count = ref(0)
    let dummy
    watchEffect(
      () => {
        dummy = count.value
      },
      // @ts-expect-error
      { immediate: false }
    )
    expect(dummy).toBe(0)
    expect(`"immediate" option is only respected`).toHaveBeenWarned()

    count.value++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('warn and not respect deep option when using effect', async () => {
    const arr = ref([1, [2]])
    const spy = vi.fn()
    watchEffect(
      () => {
        spy()
        return arr
      },
      // @ts-expect-error
      { deep: true }
    )
    expect(spy).toHaveBeenCalledTimes(1)
    ;(arr.value[1] as Array<number>)[0] = 3
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(`"deep" option is only respected`).toHaveBeenWarned()
  })

  it('onTrack', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrack = vi.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1 })
    const r = ref(2)
    const c = computed(() => r.value + 1)
    watchEffect(
      () => {
        dummy = obj.foo + r.value + c.value
      },
      { onTrack }
    )
    await nextTick()
    expect(dummy).toEqual(6)
    expect(onTrack).toHaveBeenCalledTimes(3)
    expect(events).toMatchObject([
      {
        target: obj,
        type: TrackOpTypes.GET,
        key: 'foo'
      },
      {
        target: r,
        type: TrackOpTypes.GET,
        key: 'value'
      },
      {
        target: c,
        type: TrackOpTypes.GET,
        key: 'value'
      }
    ])
  })

  it('onTrigger', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrigger = vi.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive<{
      foo: number
      bar: any[]
      baz: { qux?: number }
    }>({ foo: 1, bar: [], baz: {} })

    watchEffect(
      () => {
        dummy = obj.foo + (obj.bar[0] || 0) + (obj.baz.qux || 0)
      },
      { onTrigger }
    )
    await nextTick()
    expect(dummy).toBe(1)

    obj.foo++
    await nextTick()
    expect(dummy).toBe(2)
    expect(onTrigger).toHaveBeenCalledTimes(1)
    expect(events[0]).toMatchObject({
      type: TriggerOpTypes.SET,
      key: 'foo',
      target: obj,
      oldValue: 1,
      newValue: 2
    })

    obj.bar.push(1)
    await nextTick()
    expect(dummy).toBe(3)
    expect(onTrigger).toHaveBeenCalledTimes(2)
    expect(events[1]).toMatchObject({
      type: TriggerOpTypes.ARRAY_MUTATION,
      target: obj.bar,
      key: 'push'
    })

    set(obj.baz, 'qux', 1)
    await nextTick()
    expect(dummy).toBe(4)
    expect(onTrigger).toHaveBeenCalledTimes(3)
    expect(events[2]).toMatchObject({
      type: TriggerOpTypes.ADD,
      target: obj.baz,
      key: 'qux'
    })
  })

  it('should work sync', () => {
    const v = ref(1)
    let calls = 0

    watch(
      v,
      () => {
        ++calls
      },
      {
        flush: 'sync'
      }
    )

    expect(calls).toBe(0)
    v.value++
    expect(calls).toBe(1)
  })

  test('should force trigger on triggerRef when watching a shallow ref', async () => {
    const v = shallowRef({ a: 1 })
    let sideEffect = 0
    watch(v, obj => {
      sideEffect = obj.a
    })

    v.value = v.value
    await nextTick()
    // should not trigger
    expect(sideEffect).toBe(0)

    v.value.a++
    await nextTick()
    // should not trigger
    expect(sideEffect).toBe(0)

    triggerRef(v)
    await nextTick()
    // should trigger now
    expect(sideEffect).toBe(2)
  })

  test('should force trigger on triggerRef when watching multiple sources: shallow ref array', async () => {
    const v = shallowRef([] as any)
    const spy = vi.fn()
    watch([v], () => {
      spy()
    })

    v.value.push(1)
    triggerRef(v)

    await nextTick()
    // should trigger now
    expect(spy).toHaveBeenCalledTimes(1)
  })

  // vuejs/core#2125
  test('watchEffect should not recursively trigger itself', async () => {
    const spy = vi.fn()
    const price = ref(10)
    const history = ref<number[]>([])
    watchEffect(() => {
      history.value.push(price.value)
      spy()
    })
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  // vuejs/core#2231
  test('computed refs should not trigger watch if value has no change', async () => {
    const spy = vi.fn()
    const source = ref(0)
    const price = computed(() => source.value === 0)
    watch(price, spy)
    source.value++
    await nextTick()
    source.value++
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('this.$watch should pass `this.proxy` to watch source as the first argument ', () => {
    let instance: any
    const source = vi.fn()

    const Comp = {
      render() {},
      created(this: any) {
        instance = this
        this.$watch(source, function () {})
      }
    }

    const root = document.createElement('div')
    new Vue(Comp).$mount(root)

    expect(instance).toBeDefined()
    expect(source).toHaveBeenCalledWith(instance)
  })

  test('should not leak `this.proxy` to setup()', () => {
    const source = vi.fn()

    const Comp = {
      render() {},
      setup() {
        watch(source, () => {})
      }
    }

    const root = document.createElement('div')
    new Vue(Comp).$mount(root)
    // should not have any arguments
    expect(source.mock.calls[0]).toMatchObject([])
  })

  // vuejs/core#2728
  test('pre watcher callbacks should not track dependencies', async () => {
    const a = ref(0)
    const b = ref(0)
    const updated = vi.fn()
    const cb = vi.fn()

    const Child = {
      props: ['a'],
      updated,
      watch: {
        a() {
          cb()
          b.value
        }
      },
      render() {
        return h('div', this.a)
      }
    }

    const Parent = {
      render() {
        return h(Child, { props: { a: a.value } })
      }
    }

    const root = document.createElement('div')
    new Vue(Parent).$mount(root)

    a.value++
    await nextTick()
    expect(updated).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledTimes(1)

    b.value++
    await nextTick()
    // should not track b as dependency of Child
    expect(updated).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('watching sources: ref<any[]>', async () => {
    const foo = ref([1])
    const spy = vi.fn()
    watch(foo, () => {
      spy()
    })
    foo.value = foo.value.slice()
    await nextTick()
    expect(spy).toBeCalledTimes(1)
  })

  it('watching multiple sources: computed', async () => {
    let count = 0
    const value = ref('1')
    const plus = computed(() => !!value.value)
    watch([plus], () => {
      count++
    })
    value.value = '2'
    await nextTick()
    expect(plus.value).toBe(true)
    expect(count).toBe(0)
  })

  // vuejs/core#4158
  test('watch should not register in owner component if created inside detached scope', () => {
    let instance: Component
    const Comp = {
      setup() {
        instance = getCurrentInstance()!.proxy
        effectScope(true).run(() => {
          watch(
            () => 1,
            () => {}
          )
        })
        return () => ''
      }
    }
    const root = document.createElement('div')
    new Vue(Comp).$mount(root)
    // should not record watcher in detached scope and only the instance's
    // own update effect
    expect(instance!._scope.effects.length).toBe(1)
  })

  // #12578
  test('template ref triggered watcher should fire after component mount', async () => {
    const order: string[] = []
    const Child = { template: '<div/>' }
    const App = {
      setup() {
        const child = ref<any>(null)
        onMounted(() => {
          order.push('mounted')
        })
        watch(child, () => {
          order.push('watcher')
        })
        return { child }
      },
      components: { Child },
      template: `<Child ref="child"/>`
    }
    new Vue(App).$mount()

    await nextTick()
    expect(order).toMatchObject([`mounted`, `watcher`])
  })

  // #12624
  test('pre watch triggered in mounted hook', async () => {
    const spy = vi.fn()
    new Vue({
      setup() {
        const c = ref(0)

        onMounted(() => {
          c.value++
        })

        watchEffect(() => spy(c.value))
        return () => {}
      }
    }).$mount()
    expect(spy).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  // #12643
  test('should trigger watch on reactive object when new property is added via set()', () => {
    const spy = vi.fn()
    const obj = reactive({})
    watch(obj, spy, { flush: 'sync' })
    set(obj, 'foo', 1)
    expect(spy).toHaveBeenCalled()
  })

  test('should not trigger watch when calling set() on ref value', () => {
    const spy = vi.fn()
    const r = ref({})
    watch(r, spy, { flush: 'sync' })
    set(r.value, 'foo', 1)
    expect(spy).not.toHaveBeenCalled()
  })

  // #12664
  it('queueing multiple flush: post watchers', async () => {
    const parentSpy = vi.fn()
    const childSpy = vi.fn()

    const Child = {
      setup() {
        const el = ref()
        watch(el, childSpy, { flush: 'post' })
        return { el }
      },
      template: `<div><span ref="el">hello child</span></div>`
    }
    const App = {
      components: { Child },
      setup() {
        const el = ref()
        watch(el, parentSpy, { flush: 'post' })
        return { el }
      },
      template: `<div><Child /><span ref="el">hello app1</span></div>`
    }

    const container = document.createElement('div')
    const root = document.createElement('div')
    container.appendChild(root)
    new Vue(App).$mount(root)

    await nextTick()
    expect(parentSpy).toHaveBeenCalledTimes(1)
    expect(childSpy).toHaveBeenCalledTimes(1)
  })
})
