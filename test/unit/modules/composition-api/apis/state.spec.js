const Vue = require('vue/dist/vue.common.js')
const {
  reactive,
  ref,
  watch,
  set,
  toRefs,
  computed,
  unref,
} = require('../../src')

describe('api/ref', () => {
  it('should work with array', () => {
    let arr
    new Vue({
      setup() {
        arr = ref([2])
        arr.value.push(3)
        arr.value.unshift(1)
      },
    })
    expect(arr.value).toEqual([1, 2, 3])
  })

  it('should hold a value', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
    a.value = 2
    expect(a.value).toBe(2)
  })

  it('should be reactive', (done) => {
    const a = ref(1)
    let dummy
    watch(
      a,
      () => {
        dummy = a.value
      },
      { immediate: true }
    )
    expect(dummy).toBe(1)
    a.value = 2
    waitForUpdate(() => {
      expect(dummy).toBe(2)
    }).then(done)
  })

  it('should make nested properties reactive', (done) => {
    const a = ref({
      count: 1,
    })
    let dummy
    watch(
      a,
      () => {
        dummy = a.value.count
      },
      { deep: true, immediate: true }
    )
    expect(dummy).toBe(1)
    a.value.count = 2
    waitForUpdate(() => {
      expect(dummy).toBe(2)
    }).then(done)
  })
})

describe('api/reactive', () => {
  it('should work', (done) => {
    const app = new Vue({
      setup() {
        return {
          state: reactive({
            count: 0,
          }),
        }
      },
      render(h) {
        return h('div', [h('span', this.state.count)])
      },
    }).$mount()

    expect(app.$el.querySelector('span').textContent).toBe('0')
    app.state.count++
    waitForUpdate(() => {
      expect(app.$el.querySelector('span').textContent).toBe('1')
    }).then(done)
  })

  it('should warn for non-object params', () => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)
    reactive()
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: "reactive()" is called without provide an "object".'
    )
    reactive(false)
    expect(warn.mock.calls[1][0]).toMatch(
      '[Vue warn]: "reactive()" is called without provide an "object".'
    )
    expect(warn).toBeCalledTimes(2)
    warn.mockRestore()
  })
})

describe('api/toRefs', () => {
  it('should work', (done) => {
    const state = reactive({
      foo: 1,
      bar: 2,
    })

    let dummy
    watch(
      () => state,
      () => {
        dummy = state.foo
      },
      { immediate: true }
    )
    const stateAsRefs = toRefs(state)
    expect(dummy).toBe(1)
    expect(stateAsRefs.foo.value).toBe(1)
    expect(stateAsRefs.bar.value).toBe(2)
    state.foo++
    waitForUpdate(() => {
      dummy = 2
      expect(stateAsRefs.foo.value).toBe(2)
      stateAsRefs.foo.value++
    })
      .then(() => {
        dummy = 3
        expect(state.foo).toBe(3)
      })
      .then(done)
  })

  it('should proxy plain object but not make it a reactive', () => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)
    const spy = jest.fn()
    const state = {
      foo: 1,
      bar: 2,
    }

    watch(() => state, spy, { flush: 'sync', lazy: true })
    const stateAsRefs = toRefs(state)

    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: toRefs() expects a reactive object but received a plain one.'
    )

    expect(stateAsRefs.foo.value).toBe(1)
    expect(stateAsRefs.bar.value).toBe(2)
    state.foo++
    expect(stateAsRefs.foo.value).toBe(2)

    stateAsRefs.foo.value++
    expect(state.foo).toBe(3)

    expect(spy).not.toHaveBeenCalled()
    expect(warn).toBeCalledTimes(1)
    warn.mockRestore()
  })
})

describe('unwrapping', () => {
  it('should work', () => {
    const obj = reactive({
      a: ref(0),
    })
    const objWrapper = ref(obj)
    let dummy
    watch(
      () => obj,
      () => {
        dummy = obj.a
      },
      { deep: true, flush: 'sync', immediate: true }
    )
    expect(dummy).toBe(0)
    expect(obj.a).toBe(0)
    expect(objWrapper.value.a).toBe(0)
    obj.a++
    expect(dummy).toBe(1)
    objWrapper.value.a++
    expect(dummy).toBe(2)
  })

  it('should not unwrap a ref', () => {
    const a = ref(0)
    const b = ref(a)
    expect(a.value).toBe(0)
    expect(b).toBe(a)
  })

  it('should not unwrap a ref when re-assign', () => {
    const a = ref('foo')
    expect(a.value).toBe('foo')
    const b = ref()
    a.value = b
    expect(a.value).toBe(b)
  })

  it('should unwrap ref in a nested object', () => {
    const a = ref(0)
    const b = ref({
      count: a,
    })
    expect(b.value.count).toBe(0)
    a.value++
    expect(b.value.count).toBe(1)
  })

  it('should unwrap when re-assign', () => {
    const a = ref()
    const b = ref(a)
    expect(b.value).toBe(a.value)
    const c = ref(0)
    b.value = {
      count: c,
    }
    expect(b.value.count).toBe(0)
    c.value++
    expect(b.value.count).toBe(1)
  })

  it('should keep reactivity(same ref)', () => {
    const a = ref(1)
    const obj = reactive({
      a,
      b: {
        c: a,
      },
    })
    let dummy1
    let dummy2
    watch(
      () => obj,
      () => {
        dummy1 = obj.a
        dummy2 = obj.b.c
      },
      { deep: true, flush: 'sync', immediate: true }
    )
    expect(dummy1).toBe(1)
    expect(dummy2).toBe(1)
    a.value++
    expect(dummy1).toBe(2)
    expect(dummy2).toBe(2)
    obj.a++
    expect(dummy1).toBe(3)
    expect(dummy2).toBe(3)
  })

  it('should keep reactivity(different ref)', () => {
    const count = ref(1)
    const count1 = ref(1)
    const obj = reactive({
      a: count,
      b: {
        c: count1,
      },
    })

    let dummy1
    let dummy2
    watch(
      () => obj,
      () => {
        dummy1 = obj.a
        dummy2 = obj.b.c
      },
      { deep: true, flush: 'sync', immediate: true }
    )
    expect(dummy1).toBe(1)
    expect(dummy2).toBe(1)
    expect(obj.a).toBe(1)
    expect(obj.b.c).toBe(1)
    obj.a++
    expect(dummy1).toBe(2)
    expect(dummy2).toBe(1)
    expect(count.value).toBe(2)
    expect(count1.value).toBe(1)
    count.value++
    expect(dummy1).toBe(3)
    expect(count.value).toBe(3)
    count1.value++
    expect(dummy2).toBe(2)
    expect(count1.value).toBe(2)
  })

  it('should keep reactivity(new property of object)', () => {
    const count = ref(1)
    const obj = reactive({
      a: {},
      b: [],
    })
    let dummy
    watch(
      () => obj,
      () => {
        dummy = obj.a.foo
      },
      { deep: true, flush: 'sync' }
    )
    expect(dummy).toBe(undefined)
    set(obj.a, 'foo', count)
    expect(dummy).toBe(1)
    count.value++
    expect(dummy).toBe(2)
    obj.a.foo++
    expect(dummy).toBe(3)
  })

  it('ref should be replaced)', () => {
    const bRef = ref(1)
    const obj = reactive({
      a: {
        b: bRef,
      },
    })

    let dummy
    watch(
      () => obj,
      () => {
        dummy = obj.a.b
      },
      { deep: true, lazy: true, flush: 'sync' }
    )
    expect(dummy).toBeUndefined()
    const replacedRef = ref(2)
    obj.a.b = replacedRef
    expect(dummy).toBe(2)
    obj.a.b++
    expect(replacedRef.value).toBe(3)
    expect(dummy).toBe(3)

    // bRef.value should not change
    expect(bRef.value).toBe(1)
  })

  it('should not unwrap ref in Array index', () => {
    const a = ref(0)
    const state = reactive({
      list: [a],
    })

    expect(state.list[0]).toBe(a)
    expect(state.list[0].value).toBe(0)
  })

  it('should unrwap ref', () => {
    expect(unref(0)).toBe(0)
    expect(unref(ref(0))).toBe(0)
    expect(unref({ value: 1 })).toStrictEqual({ value: 1 })
  })

  it('should now unwrap plain object when using set at Array', () => {
    const state = reactive({
      list: [],
    })

    let dummy
    watch(
      () => state.list,
      () => {
        dummy = state.list[0].count
      },
      { lazy: true, flush: 'sync' }
    )
    expect(dummy).toBeUndefined()
    const a = ref(0)
    set(state.list, 0, {
      count: a,
    })
    expect(dummy).toBe(a)
  })

  it('should not call the computed property until accessing it', () => {
    const spy = jest.fn()
    const state = reactive({
      count: 1,
      double: computed(() => {
        spy()
        return state.count * 2
      }),
    })

    expect(spy).not.toHaveBeenCalled()
    expect(state.double).toBe(2)
    expect(spy).toHaveBeenCalled()
  })

  // #517
  it('should not throw callstack error', () => {
    const a = {
      b: 1,
    }
    a.a = a

    reactive(a)
  })
})
