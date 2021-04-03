import {
  computed,
  reactive,
  ref,
  watchEffect,
  WritableComputedRef,
  nextTick,
} from '../../../src'
import { mockWarn } from '../../helpers'

describe('reactivity/computed', () => {
  mockWarn(true)

  it('should return updated value', async () => {
    const value = reactive<{ foo?: number }>({ foo: undefined })
    const cValue = computed(() => value.foo)
    expect(cValue.value).toBe(undefined)
    value.foo = 1
    await nextTick()

    expect(cValue.value).toBe(1)
  })

  it('should compute lazily', () => {
    const value = reactive<{ foo?: number }>({ foo: undefined })
    const getter = jest.fn(() => value.foo)
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
    watchEffect(
      () => {
        dummy = cValue.value
      },
      { flush: 'sync' }
    )
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
    const getter1 = jest.fn(() => value.foo)
    const getter2 = jest.fn(() => {
      return c1.value + 1
    })
    const c1 = computed(getter1)
    const c2 = computed(getter2)

    let dummy
    watchEffect(
      () => {
        dummy = c2.value
      },
      { flush: 'sync' }
    )
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
    const getter1 = jest.fn(() => value.foo)
    const getter2 = jest.fn(() => {
      return c1.value + 1
    })
    const c1 = computed(getter1)
    const c2 = computed(getter2)

    let dummy
    watchEffect(() => {
      dummy = c1.value + c2.value
    })
    await nextTick()
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

  // it('should no longer update when stopped', () => {
  //   const value = reactive<{ foo?: number }>({});
  //   const cValue = computed(() => value.foo);
  //   let dummy;
  //   effect(() => {
  //     dummy = cValue.value;
  //   });
  //   expect(dummy).toBe(undefined);
  //   value.foo = 1;
  //   expect(dummy).toBe(1);
  //   stop(cValue.effect);
  //   value.foo = 2;
  //   expect(dummy).toBe(1);
  // });

  it('should support setter', () => {
    const n = ref(1)
    const plusOne = computed({
      get: () => n.value + 1,
      set: (val) => {
        n.value = val - 1
      },
    })

    expect(plusOne.value).toBe(2)
    n.value++
    expect(plusOne.value).toBe(3)

    plusOne.value = 0
    expect(n.value).toBe(-1)
  })

  it('should trigger effect w/ setter', async () => {
    const n = ref(1)
    const plusOne = computed({
      get: () => n.value + 1,
      set: (val) => {
        n.value = val - 1
      },
    })

    let dummy
    watchEffect(() => {
      dummy = n.value
    })
    expect(dummy).toBe(1)

    plusOne.value = 0
    await nextTick()
    expect(dummy).toBe(-1)
  })

  it('should warn if trying to set a readonly computed', async () => {
    const n = ref(1)
    const plusOne = computed(() => n.value + 1)
    ;(plusOne as WritableComputedRef<number>).value++ // Type cast to prevent TS from preventing the error
    await nextTick()

    expect(
      'Write operation failed: computed value is readonly'
    ).toHaveBeenWarnedLast()
  })
})
