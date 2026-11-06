import {
  computed,
  reactive,
  ref,
  isReadonly,
  WritableComputedRef,
  DebuggerEvent,
  TrackOpTypes,
  TriggerOpTypes
} from 'v3'
import { effect } from 'v3/reactivity/effect'
import { nextTick } from 'core/util'
import { set, del } from 'core/observer/index'

describe('reactivity/computed', () => {
  it('should return updated value', () => {
    const value = reactive({ foo: 1 })
    const cValue = computed(() => value.foo)
    expect(cValue.value).toBe(1)
    value.foo = 2
    expect(cValue.value).toBe(2)
  })

  it('should compute lazily', () => {
    const value = reactive<{ foo?: number }>({ foo: undefined })
    const getter = vi.fn(() => value.foo)
    const cValue = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(undefined)
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute until needed
    value.foo = 1
    expect(getter).toHaveBeenCalledTimes(1)

    // now it should compute
    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(2)

    // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })

  it('should trigger effect', () => {
    const value = reactive<{ foo?: number }>({ foo: undefined })
    const cValue = computed(() => value.foo)
    let dummy
    effect(() => {
      dummy = cValue.value
    })
    expect(dummy).toBe(undefined)
    value.foo = 1
    expect(dummy).toBe(1)
  })

  it('should work when chained', () => {
    const value = reactive({ foo: 0 })
    const c1 = computed(() => value.foo)
    const c2 = computed(() => c1.value + 1)
    expect(c2.value).toBe(1)
    expect(c1.value).toBe(0)
    value.foo++
    expect(c2.value).toBe(2)
    expect(c1.value).toBe(1)
  })

  it('should trigger effect when chained', () => {
    const value = reactive({ foo: 0 })
    const getter1 = vi.fn(() => value.foo)
    const getter2 = vi.fn(() => {
      return c1.value + 1
    })
    const c1 = computed(getter1)
    const c2 = computed(getter2)

    let dummy
    effect(() => {
      dummy = c2.value
    })
    expect(dummy).toBe(1)
    expect(getter1).toHaveBeenCalledTimes(1)
    expect(getter2).toHaveBeenCalledTimes(1)
    value.foo++
    expect(dummy).toBe(2)
    // should not result in duplicate calls
    expect(getter1).toHaveBeenCalledTimes(2)
    expect(getter2).toHaveBeenCalledTimes(2)
  })

  it('should trigger effect when chained (mixed invocations)', async () => {
    const value = reactive({ foo: 0 })
    const getter1 = vi.fn(() => value.foo)
    const getter2 = vi.fn(() => {
      return c1.value + 1
    })
    const c1 = computed(getter1)
    const c2 = computed(getter2)

    let dummy
    // @discrepancy Vue 2 chained computed doesn't work with sync watchers
    effect(() => {
      dummy = c1.value + c2.value
    }, nextTick)
    expect(dummy).toBe(1)

    expect(getter1).toHaveBeenCalledTimes(1)
    expect(getter2).toHaveBeenCalledTimes(1)
    value.foo++

    await nextTick()
    expect(dummy).toBe(3)
    // should not result in duplicate calls
    expect(getter1).toHaveBeenCalledTimes(2)
    expect(getter2).toHaveBeenCalledTimes(2)
  })

  it('should no longer update when stopped', () => {
    const value = reactive<{ foo?: number }>({ foo: undefined })
    const cValue = computed(() => value.foo)
    let dummy
    effect(() => {
      dummy = cValue.value
    })
    expect(dummy).toBe(undefined)
    value.foo = 1
    expect(dummy).toBe(1)
    cValue.effect.teardown()
    value.foo = 2
    expect(dummy).toBe(1)
  })

  it('should support setter', () => {
    const n = ref(1)
    const plusOne = computed({
      get: () => n.value + 1,
      set: val => {
        n.value = val - 1
      }
    })

    expect(plusOne.value).toBe(2)
    n.value++
    expect(plusOne.value).toBe(3)

    plusOne.value = 0
    expect(n.value).toBe(-1)
  })

  it('should trigger effect w/ setter', () => {
    const n = ref(1)
    const plusOne = computed({
      get: () => n.value + 1,
      set: val => {
        n.value = val - 1
      }
    })

    let dummy
    effect(() => {
      dummy = n.value
    })
    expect(dummy).toBe(1)

    plusOne.value = 0
    expect(dummy).toBe(-1)
  })

  // #5720
  it('should invalidate before non-computed effects', async () => {
    let plusOneValues: number[] = []
    const n = ref(0)
    const plusOne = computed(() => n.value + 1)
    effect(() => {
      n.value
      plusOneValues.push(plusOne.value)
    }, nextTick)
    expect(plusOneValues).toMatchObject([1])
    // access plusOne, causing it to be non-dirty
    plusOne.value
    // mutate n
    n.value++
    await nextTick()
    // on the 2nd run, plusOne.value should have already updated.
    expect(plusOneValues).toMatchObject([1, 2])
  })

  it('should warn if trying to set a readonly computed', () => {
    const n = ref(1)
    const plusOne = computed(() => n.value + 1)
    ;(plusOne as WritableComputedRef<number>).value++ // Type cast to prevent TS from preventing the error

    expect(
      'Write operation failed: computed value is readonly'
    ).toHaveBeenWarnedLast()
  })

  it('should be readonly', () => {
    let a = { a: 1 }
    const x = computed(() => a)
    expect(isReadonly(x)).toBe(true)
    expect(isReadonly(x.value)).toBe(false)
    expect(isReadonly(x.value.a)).toBe(false)
    const z = computed<typeof a>({
      get() {
        return a
      },
      set(v) {
        a = v
      }
    })
    expect(isReadonly(z)).toBe(false)
    expect(isReadonly(z.value.a)).toBe(false)
  })

  it('should expose value when stopped', () => {
    const x = computed(() => 1)
    x.effect.teardown()
    expect(x.value).toBe(1)
  })

  it('debug: onTrack', () => {
    let events: DebuggerEvent[] = []
    const onTrack = vi.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1, bar: 2 })
    const c = computed(() => obj.foo + obj.bar, {
      onTrack
    })
    expect(c.value).toEqual(3)
    expect(onTrack).toHaveBeenCalledTimes(2)
    expect(events).toEqual([
      {
        effect: c.effect,
        target: obj,
        type: TrackOpTypes.GET,
        key: 'foo'
      },
      {
        effect: c.effect,
        target: obj,
        type: TrackOpTypes.GET,
        key: 'bar'
      }
    ])
  })

  it('debug: onTrigger', () => {
    let events: DebuggerEvent[] = []
    const onTrigger = vi.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1, bar: { baz: 2 } })
    const c = computed(() => obj.foo + (obj.bar.baz || 0), { onTrigger })

    // computed won't trigger compute until accessed
    c.value

    obj.foo++
    expect(c.value).toBe(4)
    expect(onTrigger).toHaveBeenCalledTimes(1)
    expect(events[0]).toEqual({
      effect: c.effect,
      target: obj,
      type: TriggerOpTypes.SET,
      key: 'foo',
      oldValue: 1,
      newValue: 2
    })

    del(obj.bar, 'baz')
    expect(c.value).toBe(2)
    expect(onTrigger).toHaveBeenCalledTimes(2)
    expect(events[1]).toEqual({
      effect: c.effect,
      target: obj.bar,
      type: TriggerOpTypes.DELETE,
      key: 'baz'
    })

    set(obj.bar, 'baz', 1)
    expect(c.value).toBe(3)
    expect(onTrigger).toHaveBeenCalledTimes(3)
    expect(events[2]).toEqual({
      effect: c.effect,
      target: obj.bar,
      type: TriggerOpTypes.ADD,
      key: 'baz',
      oldValue: undefined,
      newValue: 1
    })
  })
})
