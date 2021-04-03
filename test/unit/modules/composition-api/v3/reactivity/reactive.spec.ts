import {
  ref,
  isRef,
  reactive,
  isReactive,
  computed,
  toRaw,
  shallowReactive,
  set,
  markRaw,
} from '../../../src'

describe('reactivity/reactive', () => {
  let warn: jest.SpyInstance
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)
    warn.mockReset()
  })
  afterEach(() => {
    expect(warn).not.toBeCalled()
    warn.mockRestore()
  })

  test('Object', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).toBe(original)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(true) // this is false in v3 but true in v2
    // get
    expect(observed.foo).toBe(1)
    // has
    expect('foo' in observed).toBe(true)
    // ownKeys
    expect(Object.keys(observed)).toEqual(['foo'])
  })

  test('proto', () => {
    const obj = {}
    const reactiveObj = reactive(obj)
    expect(isReactive(reactiveObj)).toBe(true)
    // read prop of reactiveObject will cause reactiveObj[prop] to be reactive
    // @ts-ignore
    const prototype = reactiveObj['__proto__']
    const otherObj = { data: ['a'] }
    expect(isReactive(otherObj)).toBe(false)
    const reactiveOther = reactive(otherObj)
    expect(isReactive(reactiveOther)).toBe(true)
    expect(reactiveOther.data[0]).toBe('a')
  })
  test('nested reactives', () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })

  test('observed value should proxy mutations to original (Object)', () => {
    const original: any = { foo: 1 }
    const observed = reactive(original)
    // set
    observed.bar = 1
    expect(observed.bar).toBe(1)
    expect(original.bar).toBe(1)
    // delete
    delete observed.foo
    expect('foo' in observed).toBe(false)
    expect('foo' in original).toBe(false)
  })

  test('setting a property with an unobserved value should wrap with reactive', () => {
    const observed = reactive<{ foo?: object }>({})
    const raw = {}
    set(observed, 'foo', raw) // v2 limitation

    expect(observed.foo).toBe(raw) // v2 limitation
    expect(isReactive(observed.foo)).toBe(true)
  })

  test('observing already observed value should return same Proxy', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    const observed2 = reactive(observed)
    expect(observed2).toBe(observed)
  })

  test('observing the same value multiple times should return same Proxy', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    const observed2 = reactive(original)
    expect(observed2).toBe(observed)
  })

  test('should not pollute original object with Proxies', () => {
    const original: any = { foo: 1 }
    const original2 = { bar: 2 }
    const observed = reactive(original)
    const observed2 = reactive(original2)
    observed.bar = observed2
    expect(observed.bar).toBe(observed2)
    expect(original.bar).toBe(original2)
  })

  test('unwrap', () => {
    // vue2 mutates the original object
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(toRaw(observed)).toBe(original)
    expect(toRaw(original)).toBe(original)
  })

  test('should not unwrap Ref<T>', () => {
    const observedNumberRef = reactive(ref(1))
    const observedObjectRef = reactive(ref({ foo: 1 }))

    expect(isRef(observedNumberRef)).toBe(true)
    expect(isRef(observedObjectRef)).toBe(true)
  })

  test('should unwrap computed refs', () => {
    // readonly
    const a = computed(() => 1)
    // writable
    const b = computed({
      get: () => 1,
      set: () => {},
    })
    const obj = reactive({ a, b })
    // check type
    obj.a + 1
    obj.b + 1
    expect(typeof obj.a).toBe(`number`)
    expect(typeof obj.b).toBe(`number`)
  })

  test('non-observable values', () => {
    const assertValue = (value: any) => {
      expect(isReactive(reactive(value))).toBe(false)
      // expect(warnSpy).toHaveBeenLastCalledWith(`value cannot be made reactive: ${String(value)}`);
    }

    // number
    assertValue(1)
    // string
    assertValue('foo')
    // boolean
    assertValue(false)
    // null
    assertValue(null)
    // undefined
    assertValue(undefined)
    // symbol
    const s = Symbol()
    assertValue(s)

    // built-ins should work and return same value
    const p = Promise.resolve()
    expect(reactive(p)).toBe(p)
    const r = new RegExp('')
    expect(reactive(r)).toBe(r)
    const d = new Date()
    expect(reactive(d)).toBe(d)

    expect(warn).toBeCalledTimes(3)
    expect(
      warn.mock.calls.map((call) => {
        expect(call[0]).toBe(
          '[Vue warn]: "reactive()" is called without provide an "object".'
        )
      })
    )
    warn.mockReset()
  })

  test('markRaw', () => {
    const obj = reactive({
      foo: { a: 1 },
      bar: markRaw({ b: 2 }),
    })
    expect(isReactive(obj.foo)).toBe(true)
    expect(isReactive(obj.bar)).toBe(false)
  })

  test('should not observe frozen objects', () => {
    const obj = reactive({
      foo: Object.freeze({ a: 1 }),
    })
    expect(isReactive(obj.foo)).toBe(false)
  })

  describe('shallowReactive', () => {
    test('should not make non-reactive properties reactive', () => {
      const props = shallowReactive({ n: { foo: 1 } })
      expect(isReactive(props.n)).toBe(false)
    })

    test('should keep reactive properties reactive', () => {
      const props: any = shallowReactive({ n: reactive({ foo: 1 }) })
      props.n = reactive({ foo: 2 })
      expect(isReactive(props.n)).toBe(true)
    })
  })
})
