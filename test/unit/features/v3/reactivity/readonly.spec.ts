import {
  reactive,
  readonly,
  toRaw,
  isReactive,
  isReadonly,
  markRaw,
  ref,
  isProxy
} from 'v3'
import { effect } from 'v3/reactivity/effect'
import { set, del } from 'core/observer'

/**
 * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html
 */
type Writable<T> = { -readonly [P in keyof T]: T[P] }

describe('reactivity/readonly', () => {
  describe('Object', () => {
    it('should make nested values readonly', () => {
      const original = { foo: 1, bar: { baz: 2 } }
      const wrapped = readonly(original)
      expect(wrapped).not.toBe(original)
      expect(isProxy(wrapped)).toBe(true)
      expect(isReactive(wrapped)).toBe(false)
      expect(isReadonly(wrapped)).toBe(true)
      expect(isReactive(original)).toBe(false)
      expect(isReadonly(original)).toBe(false)
      expect(isReactive(wrapped.bar)).toBe(false)
      expect(isReadonly(wrapped.bar)).toBe(true)
      expect(isReactive(original.bar)).toBe(false)
      expect(isReadonly(original.bar)).toBe(false)
      // get
      expect(wrapped.foo).toBe(1)
      // has
      expect('foo' in wrapped).toBe(true)
      // ownKeys
      expect(Object.keys(wrapped)).toEqual(['foo', 'bar'])
    })

    it('should not allow mutation', () => {
      const qux = Symbol('qux')
      const original = {
        foo: 1,
        bar: {
          baz: 2
        },
        [qux]: 3
      }
      const wrapped: Writable<typeof original> = readonly(original)

      wrapped.foo = 2
      expect(wrapped.foo).toBe(1)
      expect(
        `Set operation on key "foo" failed: target is readonly.`
      ).toHaveBeenWarnedLast()

      set(wrapped.bar, `baz`, 3)
      expect(wrapped.bar.baz).toBe(2)
      expect(
        `Set operation on key "baz" failed: target is readonly.`
      ).toHaveBeenWarnedLast()

      // @discrepancy: Vue 2 reactive system does not handle symbol keys.
      // wrapped[qux] = 4
      // expect(wrapped[qux]).toBe(3)
      // expect(
      //   `Set operation on key "Symbol(qux)" failed: target is readonly.`
      // ).toHaveBeenWarnedLast()

      del(wrapped, `foo`)
      expect(wrapped.foo).toBe(1)
      expect(
        `Delete operation on key "foo" failed: target is readonly.`
      ).toHaveBeenWarnedLast()

      del(wrapped.bar, `baz`)
      expect(wrapped.bar.baz).toBe(2)
      expect(
        `Delete operation on key "baz" failed: target is readonly.`
      ).toHaveBeenWarnedLast()

      // // @ts-expect-error
      // delete wrapped[qux]
      // expect(wrapped[qux]).toBe(3)
      // expect(
      //   `Delete operation on key "Symbol(qux)" failed: target is readonly.`
      // ).toHaveBeenWarnedLast()
    })

    it('should not trigger effects', () => {
      const wrapped: any = readonly({ a: 1 })
      let dummy
      effect(() => {
        dummy = wrapped.a
      })
      expect(dummy).toBe(1)
      wrapped.a = 2
      expect(wrapped.a).toBe(1)
      expect(dummy).toBe(1)
      expect(`target is readonly`).toHaveBeenWarned()
    })
  })

  // @discrepancy Vue 2 cannot support readonly array
  // describe('Array', () => {
  //   it('should make nested values readonly', () => {
  //     const original = [{ foo: 1 }]
  //     const wrapped = readonly(original)
  //     expect(wrapped).not.toBe(original)
  //     expect(isProxy(wrapped)).toBe(true)
  //     expect(isReactive(wrapped)).toBe(false)
  //     expect(isReadonly(wrapped)).toBe(true)
  //     expect(isReactive(original)).toBe(false)
  //     expect(isReadonly(original)).toBe(false)
  //     expect(isReactive(wrapped[0])).toBe(false)
  //     expect(isReadonly(wrapped[0])).toBe(true)
  //     expect(isReactive(original[0])).toBe(false)
  //     expect(isReadonly(original[0])).toBe(false)
  //     // get
  //     expect(wrapped[0].foo).toBe(1)
  //     // has
  //     expect(0 in wrapped).toBe(true)
  //     // ownKeys
  //     expect(Object.keys(wrapped)).toEqual(['0'])
  //   })

  //   it('should not allow mutation', () => {
  //     const wrapped: any = readonly([{ foo: 1 }])
  //     wrapped[0] = 1
  //     expect(wrapped[0]).not.toBe(1)
  //     expect(
  //       `Set operation on key "0" failed: target is readonly.`
  //     ).toHaveBeenWarned()
  //     wrapped[0].foo = 2
  //     expect(wrapped[0].foo).toBe(1)
  //     expect(
  //       `Set operation on key "foo" failed: target is readonly.`
  //     ).toHaveBeenWarned()

  //     // should block length mutation
  //     wrapped.length = 0
  //     expect(wrapped.length).toBe(1)
  //     expect(wrapped[0].foo).toBe(1)
  //     expect(
  //       `Set operation on key "length" failed: target is readonly.`
  //     ).toHaveBeenWarned()

  //     // mutation methods invoke set/length internally and thus are blocked as well
  //     wrapped.push(2)
  //     expect(wrapped.length).toBe(1)
  //     // push triggers two warnings on [1] and .length
  //     expect(`target is readonly.`).toHaveBeenWarnedTimes(5)
  //   })

  //   it('should not trigger effects', () => {
  //     const wrapped: any = readonly([{ a: 1 }])
  //     let dummy
  //     effect(() => {
  //       dummy = wrapped[0].a
  //     })
  //     expect(dummy).toBe(1)
  //     wrapped[0].a = 2
  //     expect(wrapped[0].a).toBe(1)
  //     expect(dummy).toBe(1)
  //     expect(`target is readonly`).toHaveBeenWarnedTimes(1)
  //     wrapped[0] = { a: 2 }
  //     expect(wrapped[0].a).toBe(1)
  //     expect(dummy).toBe(1)
  //     expect(`target is readonly`).toHaveBeenWarnedTimes(2)
  //   })
  // })

  // @discrepancy: Vue 2 doesn't support readonly on collection types
  // const maps = [Map, WeakMap]
  // maps.forEach((Collection: any) => {
  //   describe(Collection.name, () => {
  //     test('should make nested values readonly', () => {
  //       const key1 = {}
  //       const key2 = {}
  //       const original = new Collection([
  //         [key1, {}],
  //         [key2, {}]
  //       ])
  //       const wrapped = readonly(original)
  //       expect(wrapped).not.toBe(original)
  //       expect(isProxy(wrapped)).toBe(true)
  //       expect(isReactive(wrapped)).toBe(false)
  //       expect(isReadonly(wrapped)).toBe(true)
  //       expect(isReactive(original)).toBe(false)
  //       expect(isReadonly(original)).toBe(false)
  //       expect(isReactive(wrapped.get(key1))).toBe(false)
  //       expect(isReadonly(wrapped.get(key1))).toBe(true)
  //       expect(isReactive(original.get(key1))).toBe(false)
  //       expect(isReadonly(original.get(key1))).toBe(false)
  //     })

  //     test('should not allow mutation & not trigger effect', () => {
  //       const map = readonly(new Collection())
  //       const key = {}
  //       let dummy
  //       effect(() => {
  //         dummy = map.get(key)
  //       })
  //       expect(dummy).toBeUndefined()
  //       map.set(key, 1)
  //       expect(dummy).toBeUndefined()
  //       expect(map.has(key)).toBe(false)
  //       expect(
  //         `Set operation on key "${key}" failed: target is readonly.`
  //       ).toHaveBeenWarned()
  //     })

  //     // #1772
  //     test('readonly + reactive should make get() value also readonly + reactive', () => {
  //       const map = reactive(new Collection())
  //       const roMap = readonly(map)
  //       const key = {}
  //       map.set(key, {})

  //       const item = map.get(key)
  //       expect(isReactive(item)).toBe(true)
  //       expect(isReadonly(item)).toBe(false)

  //       const roItem = roMap.get(key)
  //       expect(isReactive(roItem)).toBe(true)
  //       expect(isReadonly(roItem)).toBe(true)
  //     })

  //     if (Collection === Map) {
  //       test('should retrieve readonly values on iteration', () => {
  //         const key1 = {}
  //         const key2 = {}
  //         const original = new Map([
  //           [key1, {}],
  //           [key2, {}]
  //         ])
  //         const wrapped: any = readonly(original)
  //         expect(wrapped.size).toBe(2)
  //         for (const [key, value] of wrapped) {
  //           expect(isReadonly(key)).toBe(true)
  //           expect(isReadonly(value)).toBe(true)
  //         }
  //         wrapped.forEach((value: any) => {
  //           expect(isReadonly(value)).toBe(true)
  //         })
  //         for (const value of wrapped.values()) {
  //           expect(isReadonly(value)).toBe(true)
  //         }
  //       })

  //       test('should retrieve reactive + readonly values on iteration', () => {
  //         const key1 = {}
  //         const key2 = {}
  //         const original = reactive(
  //           new Map([
  //             [key1, {}],
  //             [key2, {}]
  //           ])
  //         )
  //         const wrapped: any = readonly(original)
  //         expect(wrapped.size).toBe(2)
  //         for (const [key, value] of wrapped) {
  //           expect(isReadonly(key)).toBe(true)
  //           expect(isReadonly(value)).toBe(true)
  //           expect(isReactive(key)).toBe(true)
  //           expect(isReactive(value)).toBe(true)
  //         }
  //         wrapped.forEach((value: any) => {
  //           expect(isReadonly(value)).toBe(true)
  //           expect(isReactive(value)).toBe(true)
  //         })
  //         for (const value of wrapped.values()) {
  //           expect(isReadonly(value)).toBe(true)
  //           expect(isReactive(value)).toBe(true)
  //         }
  //       })
  //     }
  //   })
  // })

  // const sets = [Set, WeakSet]
  // sets.forEach((Collection: any) => {
  //   describe(Collection.name, () => {
  //     test('should make nested values readonly', () => {
  //       const key1 = {}
  //       const key2 = {}
  //       const original = new Collection([key1, key2])
  //       const wrapped = readonly(original)
  //       expect(wrapped).not.toBe(original)
  //       expect(isProxy(wrapped)).toBe(true)
  //       expect(isReactive(wrapped)).toBe(false)
  //       expect(isReadonly(wrapped)).toBe(true)
  //       expect(isReactive(original)).toBe(false)
  //       expect(isReadonly(original)).toBe(false)
  //       expect(wrapped.has(reactive(key1))).toBe(true)
  //       expect(original.has(reactive(key1))).toBe(false)
  //     })

  //     test('should not allow mutation & not trigger effect', () => {
  //       const set = readonly(new Collection())
  //       const key = {}
  //       let dummy
  //       effect(() => {
  //         dummy = set.has(key)
  //       })
  //       expect(dummy).toBe(false)
  //       set.add(key)
  //       expect(dummy).toBe(false)
  //       expect(set.has(key)).toBe(false)
  //       expect(
  //         `Add operation on key "${key}" failed: target is readonly.`
  //       ).toHaveBeenWarned()
  //     })

  //     if (Collection === Set) {
  //       test('should retrieve readonly values on iteration', () => {
  //         const original = new Collection([{}, {}])
  //         const wrapped: any = readonly(original)
  //         expect(wrapped.size).toBe(2)
  //         for (const value of wrapped) {
  //           expect(isReadonly(value)).toBe(true)
  //         }
  //         wrapped.forEach((value: any) => {
  //           expect(isReadonly(value)).toBe(true)
  //         })
  //         for (const value of wrapped.values()) {
  //           expect(isReadonly(value)).toBe(true)
  //         }
  //         for (const [v1, v2] of wrapped.entries()) {
  //           expect(isReadonly(v1)).toBe(true)
  //           expect(isReadonly(v2)).toBe(true)
  //         }
  //       })
  //     }
  //   })
  // })

  test('calling reactive on an readonly should return readonly', () => {
    const a = readonly({})
    const b = reactive(a)
    expect(isReadonly(b)).toBe(true)
    // should point to same original
    expect(toRaw(a)).toBe(toRaw(b))
  })

  test('calling readonly on a reactive object should return readonly', () => {
    const a = reactive({})
    const b = readonly(a)
    expect(isReadonly(b)).toBe(true)
    // should point to same original
    expect(toRaw(a)).toBe(toRaw(b))
  })

  test('readonly should track and trigger if wrapping reactive original', () => {
    const a = reactive({ n: 1 })
    const b = readonly(a)
    // should return true since it's wrapping a reactive source
    expect(isReactive(b)).toBe(true)

    let dummy
    effect(() => {
      dummy = b.n
    })
    expect(dummy).toBe(1)
    a.n++
    expect(b.n).toBe(2)
    expect(dummy).toBe(2)
  })

  // test('readonly collection should not track', () => {
  //   const map = new Map()
  //   map.set('foo', 1)

  //   const reMap = reactive(map)
  //   const roMap = readonly(map)

  //   let dummy
  //   effect(() => {
  //     dummy = roMap.get('foo')
  //   })
  //   expect(dummy).toBe(1)
  //   reMap.set('foo', 2)
  //   expect(roMap.get('foo')).toBe(2)
  //   // should not trigger
  //   expect(dummy).toBe(1)
  // })

  // test('readonly array should not track', () => {
  //   const arr = [1]
  //   const roArr = readonly(arr)

  //   const eff = effect(() => {
  //     roArr.includes(2)
  //   })
  //   expect(eff._watcher.deps.length).toBe(0)
  // })

  // test('readonly should track and trigger if wrapping reactive original (collection)', () => {
  //   const a = reactive(new Map())
  //   const b = readonly(a)
  //   // should return true since it's wrapping a reactive source
  //   expect(isReactive(b)).toBe(true)

  //   a.set('foo', 1)

  //   let dummy
  //   effect(() => {
  //     dummy = b.get('foo')
  //   })
  //   expect(dummy).toBe(1)
  //   a.set('foo', 2)
  //   expect(b.get('foo')).toBe(2)
  //   expect(dummy).toBe(2)
  // })

  test('wrapping already wrapped value should return same Proxy', () => {
    const original = { foo: 1 }
    const wrapped = readonly(original)
    const wrapped2 = readonly(wrapped)
    expect(wrapped2).toBe(wrapped)
  })

  test('wrapping the same value multiple times should return same Proxy', () => {
    const original = { foo: 1 }
    const wrapped = readonly(original)
    const wrapped2 = readonly(original)
    expect(wrapped2).toBe(wrapped)
  })

  test('markRaw', () => {
    const obj = readonly({
      foo: { a: 1 },
      bar: markRaw({ b: 2 })
    })
    expect(isReadonly(obj.foo)).toBe(true)
    expect(isReactive(obj.bar)).toBe(false)
  })

  test('should make ref readonly', () => {
    const n = readonly(ref(1))
    // @ts-expect-error
    n.value = 2
    expect(n.value).toBe(1)
    expect(
      `Set operation on key "value" failed: target is readonly.`
    ).toHaveBeenWarned()
  })

  // Test case not applicable to Vue 2
  // https://github.com/vuejs/core/issues/3376
  // test('calling readonly on computed should allow computed to set its private properties', () => {
  //   const r = ref<boolean>(false)
  //   const c = computed(() => r.value)
  //   const rC = readonly(c)

  //   r.value = true

  //   expect(rC.value).toBe(true)
  //   expect(
  //     'Set operation on key "_dirty" failed: target is readonly.'
  //   ).not.toHaveBeenWarned()
  //   // @ts-expect-error - non-existent property
  //   rC.randomProperty = true

  //   expect(
  //     'Set operation on key "randomProperty" failed: target is readonly.'
  //   ).toHaveBeenWarned()
  // })

  // #4986
  test('setting a readonly object as a property of a reactive object should retain readonly proxy', () => {
    const r = readonly({})
    const rr = reactive({}) as any
    rr.foo = r
    expect(rr.foo).toBe(r)
    expect(isReadonly(rr.foo)).toBe(true)
  })

  test('attempting to write plain value to a readonly ref nested in a reactive object should fail', () => {
    const r = ref(false)
    const ror = readonly(r)
    const obj = reactive({ ror })
    obj.ror = true
    expect(obj.ror).toBe(false)
    expect(`Set operation on key "value" failed`).toHaveBeenWarned()
  })

  test('replacing a readonly ref nested in a reactive object with a new ref', () => {
    const r = ref(false)
    const ror = readonly(r)
    const obj = reactive({ ror })
    obj.ror = ref(true) as unknown as boolean
    expect(obj.ror).toBe(true)
    expect(toRaw(obj).ror).not.toBe(ror) // ref successfully replaced
  })

  test('setting readonly object to writable nested ref', () => {
    const r = ref<any>()
    const obj = reactive({ r })
    const ro = readonly({})
    obj.r = ro
    expect(obj.r).toBe(ro)
    expect(r.value).toBe(ro)
  })

  test('compatiblity with classes', () => {
    const spy = vi.fn()
    class Foo {
      x = 1
      log() {
        spy(this.x)
      }
      change() {
        this.x++
      }
    }
    const foo = new Foo()
    const readonlyFoo = readonly(foo)
    readonlyFoo.log()
    expect(spy).toHaveBeenCalledWith(1)

    readonlyFoo.change()
    expect(readonlyFoo.x).toBe(1)
    expect(`et operation on key "x" failed`).toHaveBeenWarned()
  })

  test('warn non-extensible objects', () => {
    const foo = Object.freeze({ a: 1 })
    try {
      readonly(foo)
    } catch (e) {}
    expect(
      `Vue 2 does not support creating readonly proxy for non-extensible object`
    ).toHaveBeenWarned()
  })
})
