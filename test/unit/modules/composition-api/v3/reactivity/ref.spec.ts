import {
  ref,
  customRef,
  reactive,
  isRef,
  toRef,
  toRefs,
  Ref,
  computed,
  triggerRef,
  watchEffect,
  unref,
  isReactive,
  shallowRef,
} from '../../../src'

describe('reactivity/ref', () => {
  it('should hold a value', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
    a.value = 2
    expect(a.value).toBe(2)
  })

  it('should be reactive', () => {
    const a = ref(1)
    let dummy
    let calls = 0
    watchEffect(
      () => {
        calls++
        dummy = a.value
      },
      { flush: 'sync' }
    )
    expect(calls).toBe(1)
    expect(dummy).toBe(1)

    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // same value should not trigger
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it('should make nested properties reactive', () => {
    const a = ref({
      count: 1,
    })
    let dummy
    watchEffect(
      () => {
        dummy = a.value.count
      },
      { flush: 'sync' }
    )
    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
  })

  it('should work without initial value', () => {
    const a = ref()
    let dummy
    watchEffect(
      () => {
        dummy = a.value
      },
      { flush: 'sync' }
    )
    expect(dummy).toBe(undefined)
    a.value = 2
    expect(dummy).toBe(2)
  })

  it('should work like a normal property when nested in a reactive object', () => {
    const a = ref(1)
    const obj = reactive({
      a,
      b: {
        c: a,
      },
    })

    let dummy1: number
    let dummy2: number

    watchEffect(
      () => {
        dummy1 = obj.a
        dummy2 = obj.b.c
      },
      { flush: 'sync' }
    )

    const assertDummiesEqualTo = (val: number) =>
      [dummy1, dummy2].forEach((dummy) => expect(dummy).toBe(val))

    assertDummiesEqualTo(1)
    a.value++
    assertDummiesEqualTo(2)
    obj.a++
    assertDummiesEqualTo(3)
    obj.b.c++
    assertDummiesEqualTo(4)
  })

  it('should unwrap nested ref in types', () => {
    const a = ref(0)
    const b = ref(a)

    expect(typeof (b.value + 1)).toBe('number')
  })

  it('should unwrap nested values in types', () => {
    const a = {
      b: ref(0),
    }

    const c = ref(a)

    expect(typeof (c.value.b + 1)).toBe('number')
  })

  it('should NOT unwrap ref types nested inside arrays', () => {
    const arr = ref([1, ref(1)]).value
    ;(arr[0] as number)++
    ;(arr[1] as Ref<number>).value++

    const arr2 = ref([1, new Map<string, any>(), ref('1')]).value
    const value = arr2[0]
    if (isRef(value)) {
      value + 'foo'
    } else if (typeof value === 'number') {
      value + 1
    } else {
      // should narrow down to Map type
      // and not contain any Ref type
      value.has('foo')
    }
  })

  it('should keep tuple types', () => {
    const tuple: [number, string, { a: number }, () => number, Ref<number>] = [
      0,
      '1',
      { a: 1 },
      () => 0,
      ref(0),
    ]
    const tupleRef = ref(tuple)

    tupleRef.value[0]++
    expect(tupleRef.value[0]).toBe(1)
    tupleRef.value[1] += '1'
    expect(tupleRef.value[1]).toBe('11')
    tupleRef.value[2].a++
    expect(tupleRef.value[2].a).toBe(2)
    expect(tupleRef.value[3]()).toBe(0)
    tupleRef.value[4].value++
    expect(tupleRef.value[4].value).toBe(1)
  })

  it('should keep symbols', () => {
    const customSymbol = Symbol()
    const obj = {
      [Symbol.asyncIterator]: { a: 1 },
      [Symbol.unscopables]: { b: '1' },
      [customSymbol]: { c: [1, 2, 3] },
    }

    const objRef = ref(obj)

    expect(objRef.value[Symbol.asyncIterator]).toBe(obj[Symbol.asyncIterator])
    expect(objRef.value[Symbol.unscopables]).toBe(obj[Symbol.unscopables])
    expect(objRef.value[customSymbol]).toStrictEqual(obj[customSymbol])
  })

  test('unref', () => {
    expect(unref(1)).toBe(1)
    expect(unref(ref(1))).toBe(1)
  })

  test('shallowRef', () => {
    const sref = shallowRef({ a: 1 })
    expect(isReactive(sref.value)).toBe(false)

    let dummy
    watchEffect(
      () => {
        dummy = sref.value.a
      },
      { flush: 'sync' }
    )
    expect(dummy).toBe(1)

    sref.value = { a: 2 }
    expect(isReactive(sref.value)).toBe(false)
    expect(dummy).toBe(2)

    sref.value.a = 3
    expect(dummy).toBe(2)
  })

  test('shallowRef force trigger', () => {
    const sref = shallowRef({ a: 1 })
    let dummy
    watchEffect(
      () => {
        dummy = sref.value.a
      },
      { flush: 'sync' }
    )
    expect(dummy).toBe(1)

    sref.value.a = 2
    expect(dummy).toBe(1) // should not trigger yet

    // force trigger
    // sref.value = sref.value;
    triggerRef(sref)
    expect(dummy).toBe(2)
  })

  test('isRef', () => {
    expect(isRef(ref(1))).toBe(true)
    expect(isRef(computed(() => 1))).toBe(true)

    expect(isRef(0)).toBe(false)
    expect(isRef(1)).toBe(false)
    // an object that looks like a ref isn't necessarily a ref
    expect(isRef({ value: 0 })).toBe(false)
  })

  test('toRef', () => {
    const a = reactive({
      x: 1,
    })
    const x = toRef(a, 'x')
    expect(isRef(x)).toBe(true)
    expect(x.value).toBe(1)

    // source -> proxy
    a.x = 2
    expect(x.value).toBe(2)

    // proxy -> source
    x.value = 3
    expect(a.x).toBe(3)

    // reactivity
    let dummyX
    watchEffect(
      () => {
        dummyX = x.value
      },
      { flush: 'sync' }
    )
    expect(dummyX).toBe(x.value)

    // mutating source should trigger watchEffect using the proxy refs
    a.x = 4
    expect(dummyX).toBe(4)
  })

  test('toRefs', () => {
    const a = reactive({
      x: 1,
      y: 2,
    })

    const { x, y } = toRefs(a)

    expect(isRef(x)).toBe(true)
    expect(isRef(y)).toBe(true)
    expect(x.value).toBe(1)
    expect(y.value).toBe(2)

    // source -> proxy
    a.x = 2
    a.y = 3
    expect(x.value).toBe(2)
    expect(y.value).toBe(3)

    // proxy -> source
    x.value = 3
    y.value = 4
    expect(a.x).toBe(3)
    expect(a.y).toBe(4)

    // reactivity
    let dummyX, dummyY
    watchEffect(
      () => {
        dummyX = x.value
        dummyY = y.value
      },
      { flush: 'sync' }
    )
    expect(dummyX).toBe(x.value)
    expect(dummyY).toBe(y.value)

    // mutating source should trigger watchEffect using the proxy refs
    a.x = 4
    a.y = 5
    expect(dummyX).toBe(4)
    expect(dummyY).toBe(5)
  })

  test('customRef', () => {
    let value = 1
    let _trigger: () => void

    const custom = customRef((track, trigger) => ({
      get() {
        track()
        return value
      },
      set(newValue: number) {
        value = newValue
        _trigger = trigger
      },
    }))

    expect(isRef(custom)).toBe(true)

    let dummy
    watchEffect(
      () => {
        dummy = custom.value
      },
      { flush: 'sync' }
    )
    expect(dummy).toBe(1)

    custom.value = 2
    // should not trigger yet
    expect(dummy).toBe(1)

    _trigger!()
    expect(dummy).toBe(2)
  })
})
