import {
  isReactive,
  isShallow,
  reactive,
  shallowReactive,
  shallowReadonly
} from 'v3'

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

  test('isShallow', () => {
    expect(isShallow(shallowReactive({}))).toBe(true)
    expect(isShallow(shallowReadonly({}))).toBe(true)
  })

  // #5271
  test('should respect shallow reactive nested inside reactive on reset', () => {
    const r = reactive({ foo: shallowReactive({ bar: {} }) })
    expect(isShallow(r.foo)).toBe(true)
    expect(isReactive(r.foo.bar)).toBe(false)

    r.foo = shallowReactive({ bar: {} })
    expect(isShallow(r.foo)).toBe(true)
    expect(isReactive(r.foo.bar)).toBe(false)
  })

  // @discrepancy no shallow/non-shallow versions from the same source -
  // cannot support this without real proxies
  // #2843
  // test('should allow shallow and normal reactive for same target', () => {
  //   const original = { foo: {} }
  //   const shallowProxy = shallowReactive(original)
  //   const reactiveProxy = reactive(original)
  //   expect(shallowProxy).not.toBe(reactiveProxy)
  //   expect(isReactive(shallowProxy.foo)).toBe(false)
  //   expect(isReactive(reactiveProxy.foo)).toBe(true)
  // })

  // test('should respect shallow/deep versions of same target on access', () => {
  //   const original = {}
  //   const shallow = shallowReactive(original)
  //   const deep = reactive(original)
  //   const r = reactive({ shallow, deep })
  //   expect(r.shallow).toBe(shallow)
  //   expect(r.deep).toBe(deep)
  // })

  // @discrepancy Vue 2 does not support collections
  // describe('collections', () => {
  //   test('should be reactive', () => {
  //     const shallowSet = shallowReactive(new Set())
  //     const a = {}
  //     let size

  //     effect(() => {
  //       size = shallowSet.size
  //     })

  //     expect(size).toBe(0)

  //     shallowSet.add(a)
  //     expect(size).toBe(1)

  //     shallowSet.delete(a)
  //     expect(size).toBe(0)
  //   })

  //   test('should not observe when iterating', () => {
  //     const shallowSet = shallowReactive(new Set())
  //     const a = {}
  //     shallowSet.add(a)

  //     const spreadA = [...shallowSet][0]
  //     expect(isReactive(spreadA)).toBe(false)
  //   })

  //   test('should not get reactive entry', () => {
  //     const shallowMap = shallowReactive(new Map())
  //     const a = {}
  //     const key = 'a'

  //     shallowMap.set(key, a)

  //     expect(isReactive(shallowMap.get(key))).toBe(false)
  //   })

  //   test('should not get reactive on foreach', () => {
  //     const shallowSet = shallowReactive(new Set())
  //     const a = {}
  //     shallowSet.add(a)

  //     shallowSet.forEach(x => expect(isReactive(x)).toBe(false))
  //   })

  //   // #1210
  //   test('onTrack on called on objectSpread', () => {
  //     const onTrackFn = vi.fn()
  //     const shallowSet = shallowReactive(new Set())
  //     let a
  //     effect(
  //       () => {
  //         a = Array.from(shallowSet)
  //       },
  //       {
  //         onTrack: onTrackFn
  //       }
  //     )

  //     expect(a).toMatchObject([])
  //     expect(onTrackFn).toHaveBeenCalled()
  //   })
  // })

  // @discrepancy Vue 2 does not track array without access
  // describe('array', () => {
  //   test('should be reactive', () => {
  //     const shallowArray = shallowReactive<unknown[]>([])
  //     const a = {}
  //     let size

  //     effect(() => {
  //       size = shallowArray.length
  //     })

  //     expect(size).toBe(0)

  //     shallowArray.push(a)
  //     expect(size).toBe(1)

  //     shallowArray.pop()
  //     expect(size).toBe(0)
  //   })
  //   test('should not observe when iterating', () => {
  //     const shallowArray = shallowReactive<object[]>([])
  //     const a = {}
  //     shallowArray.push(a)

  //     const spreadA = [...shallowArray][0]
  //     expect(isReactive(spreadA)).toBe(false)
  //   })

  //   test('onTrack on called on objectSpread', () => {
  //     const onTrackFn = vi.fn()
  //     const shallowArray = shallowReactive([])
  //     let a
  //     effect(
  //       () => {
  //         a = Array.from(shallowArray)
  //       },
  //       {
  //         onTrack: onTrackFn
  //       }
  //     )

  //     expect(a).toMatchObject([])
  //     expect(onTrackFn).toHaveBeenCalled()
  //   })
  // })
})
