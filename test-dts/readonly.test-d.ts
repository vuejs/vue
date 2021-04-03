import { expectType, readonly, ref } from './index'

describe('readonly', () => {
  it('nested', () => {
    const r = readonly({
      obj: { k: 'v' },
      arr: [1, 2, '3'],
      objInArr: [{ foo: 'bar' }],
    })

    // @ts-expect-error
    r.obj = {}
    // @ts-expect-error
    r.obj.k = 'x'

    // @ts-expect-error
    r.arr.push(42)
    // @ts-expect-error
    r.objInArr[0].foo = 'bar2'
  })

  it('with ref', () => {
    const r = readonly(
      ref({
        obj: { k: 'v' },
        arr: [1, 2, '3'],
        objInArr: [{ foo: 'bar' }],
      })
    )

    console.log(r.value)

    expectType<string>(r.value.obj.k)

    // @ts-expect-error
    r.value = {}

    // @ts-expect-error
    r.value.obj = {}
    // @ts-expect-error
    r.value.obj.k = 'x'

    // @ts-expect-error
    r.value.arr.push(42)
    // @ts-expect-error
    r.value.objInArr[0].foo = 'bar2'
  })
})
