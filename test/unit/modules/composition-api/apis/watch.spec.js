const Vue = require('vue/dist/vue.common.js')
const { ref, reactive, watch, watchEffect, set } = require('../../src')

describe('api/watch', () => {
  const anyFn = expect.any(Function)
  let spy
  beforeEach(() => {
    spy = jest.fn()
  })

  afterEach(() => {
    spy.mockReset()
  })

  it('should work', (done) => {
    const onCleanupSpy = jest.fn()
    const vm = new Vue({
      setup() {
        const a = ref(1)
        watch(
          a,
          (n, o, _onCleanup) => {
            spy(n, o, _onCleanup)
            _onCleanup(onCleanupSpy)
          },
          { immediate: true }
        )
        return {
          a,
        }
      },
      template: `<div>{{a}}</div>`,
    }).$mount()
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(1, undefined, anyFn)
    expect(onCleanupSpy).toHaveBeenCalledTimes(0)
    vm.a = 2
    vm.a = 3
    expect(spy).toBeCalledTimes(1)
    waitForUpdate(() => {
      expect(spy).toBeCalledTimes(2)
      expect(spy).toHaveBeenLastCalledWith(3, 1, anyFn)
      expect(onCleanupSpy).toHaveBeenCalledTimes(1)

      vm.$destroy()
    })
      .then(() => {
        expect(onCleanupSpy).toHaveBeenCalledTimes(2)
      })
      .then(done)
  })

  it('basic usage(value wrapper)', (done) => {
    const vm = new Vue({
      setup() {
        const a = ref(1)
        watch(a, (n, o) => spy(n, o), { flush: 'pre', immediate: true })

        return {
          a,
        }
      },
      template: `<div>{{a}}</div>`,
    }).$mount()
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(1, undefined)
    vm.a = 2
    expect(spy).toBeCalledTimes(1)
    waitForUpdate(() => {
      expect(spy).toBeCalledTimes(2)
      expect(spy).toHaveBeenLastCalledWith(2, 1)
    }).then(done)
  })

  it('basic usage(function)', (done) => {
    const vm = new Vue({
      setup() {
        const a = ref(1)
        watch(
          () => a.value,
          (n, o) => spy(n, o),
          { immediate: true }
        )

        return {
          a,
        }
      },
      template: `<div>{{a}}</div>`,
    }).$mount()
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(1, undefined)
    vm.a = 2
    expect(spy).toBeCalledTimes(1)
    waitForUpdate(() => {
      expect(spy).toBeCalledTimes(2)
      expect(spy).toHaveBeenLastCalledWith(2, 1)
    }).then(done)
  })

  it('multiple cbs (after option merge)', (done) => {
    const spy1 = jest.fn()
    const a = ref(1)
    const Test = Vue.extend({
      setup() {
        watch(a, (n, o) => spy1(n, o))
      },
    })
    new Test({
      setup() {
        watch(a, (n, o) => spy(n, o))
        return {
          a,
        }
      },
      template: `<div>{{a}}</div>`,
    }).$mount()
    a.value = 2
    waitForUpdate(() => {
      expect(spy1).toHaveBeenLastCalledWith(2, 1)
      expect(spy).toHaveBeenLastCalledWith(2, 1)
    }).then(done)
  })

  it('with option: lazy', (done) => {
    const vm = new Vue({
      setup() {
        const a = ref(1)
        watch(a, (n, o) => spy(n, o), { lazy: true })

        return {
          a,
        }
      },
      template: `<div>{{a}}</div>`,
    }).$mount()
    expect(spy).not.toHaveBeenCalled()
    vm.a = 2
    waitForUpdate(() => {
      expect(spy).toHaveBeenLastCalledWith(2, 1)
    }).then(done)
  })

  it('with option: deep', (done) => {
    const vm = new Vue({
      setup() {
        const a = ref({ b: 1 })
        watch(a, (n, o) => spy(n, o), { lazy: true, deep: true })

        return {
          a,
        }
      },
      template: `<div>{{a}}</div>`,
    }).$mount()
    const oldA = vm.a
    expect(spy).not.toHaveBeenCalled()
    vm.a.b = 2
    expect(spy).not.toHaveBeenCalled()
    waitForUpdate(() => {
      expect(spy).toHaveBeenLastCalledWith(vm.a, vm.a)
      vm.a = { b: 3 }
    })
      .then(() => {
        expect(spy).toHaveBeenLastCalledWith(vm.a, oldA)
      })
      .then(done)
  })

  it('should flush after render (immediate=false)', (done) => {
    let rerenderedText
    const vm = new Vue({
      setup() {
        const a = ref(1)
        watch(
          a,
          (newVal, oldVal) => {
            spy(newVal, oldVal)
            rerenderedText = vm.$el.textContent
          },
          { lazy: true, flush: 'post' }
        )
        return {
          a,
        }
      },
      render(h) {
        return h('div', this.a)
      },
    }).$mount()
    expect(spy).not.toHaveBeenCalled()
    vm.a = 2
    waitForUpdate(() => {
      expect(rerenderedText).toBe('2')
      expect(spy).toBeCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(2, 1)
    }).then(done)
  })

  it('should flush after render (immediate=true)', (done) => {
    let rerenderedText
    var vm = new Vue({
      setup() {
        const a = ref(1)
        watch(
          a,
          (newVal, oldVal) => {
            spy(newVal, oldVal)
            if (vm) {
              rerenderedText = vm.$el.textContent
            }
          },
          { immediate: true, flush: 'post' }
        )
        return {
          a,
        }
      },
      render(h) {
        return h('div', this.a)
      },
    }).$mount()
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(1, undefined)
    vm.a = 2
    waitForUpdate(() => {
      expect(rerenderedText).toBe('2')
      expect(spy).toBeCalledTimes(2)
      expect(spy).toHaveBeenLastCalledWith(2, 1)
    }).then(done)
  })

  it('should flush before render', (done) => {
    const vm = new Vue({
      setup() {
        const a = ref(1)
        watch(
          a,
          (newVal, oldVal) => {
            spy(newVal, oldVal)
            expect(vm.$el.textContent).toBe('1')
          },
          { lazy: true, flush: 'pre' }
        )
        return {
          a,
        }
      },
      render(h) {
        return h('div', this.a)
      },
    }).$mount()
    vm.a = 2
    waitForUpdate(() => {
      expect(spy).toBeCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(2, 1)
    }).then(done)
  })

  it('should flush synchronously', (done) => {
    const vm = new Vue({
      setup() {
        const a = ref(1)
        watch(a, (n, o) => spy(n, o), { lazy: true, flush: 'sync' })
        return {
          a,
        }
      },
      render(h) {
        return h('div', this.a)
      },
    }).$mount()
    expect(spy).not.toHaveBeenCalled()
    vm.a = 2
    expect(spy).toHaveBeenLastCalledWith(2, 1)
    vm.a = 3
    expect(spy).toHaveBeenLastCalledWith(3, 2)
    waitForUpdate(() => {
      expect(spy).toBeCalledTimes(2)
    }).then(done)
  })

  it('should support watching unicode paths', (done) => {
    const vm = new Vue({
      setup() {
        const a = ref(1)
        watch(a, (n, o) => spy(n, o), { lazy: true })

        return {
          数据: a,
        }
      },
      render(h) {
        return h('div', this['数据'])
      },
    }).$mount()
    expect(spy).not.toHaveBeenCalled()
    vm['数据'] = 2
    expect(spy).not.toHaveBeenCalled()
    waitForUpdate(() => {
      expect(spy).toHaveBeenLastCalledWith(2, 1)
    }).then(done)
  })

  it('should allow to be triggered in setup', () => {
    new Vue({
      setup() {
        const count = ref(0)
        watch(count, (n, o) => spy(n, o), { flush: 'sync', immediate: true })
        count.value++
      },
    })
    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, 0, undefined)
    expect(spy).toHaveBeenNthCalledWith(2, 1, 0)
  })

  it('should run in a expected order', (done) => {
    const result = []
    var vm = new Vue({
      setup() {
        const x = ref(0)

        // prettier-ignore
        watchEffect(() => { void x.value; result.push('sync effect'); }, { flush: 'sync' });
        // prettier-ignore
        watchEffect(() => { void x.value; result.push('pre effect'); }, { flush: 'pre' });
        // prettier-ignore
        watchEffect(() => { void x.value; result.push('post effect'); }, { flush: 'post' });

        // prettier-ignore
        watch(x, () => { result.push('sync callback') }, { flush: 'sync', immediate: true  })
        // prettier-ignore
        watch(x, () => { result.push('pre callback') }, { flush: 'pre', immediate: true  })
        // prettier-ignore
        watch(x, () => { result.push('post callback') }, { flush: 'post', immediate: true  })

        const inc = () => {
          result.push('before inc')
          x.value++
          result.push('after inc')
        }

        return { x, inc }
      },
      template: `<div>{{x}}</div>`,
    }).$mount()
    expect(result).toEqual([
      'sync effect',
      'pre effect',
      'post effect',
      'sync callback',
      'pre callback',
      'post callback',
    ])
    result.length = 0

    waitForUpdate(() => {
      expect(result).toEqual([])
      result.length = 0

      vm.inc()
    })
      .then(() => {
        expect(result).toEqual([
          'before inc',
          'sync effect',
          'sync callback',
          'after inc',
          'pre effect',
          'pre callback',
          'post effect',
          'post callback',
        ])
      })
      .then(done)
  })

  describe('simple effect', () => {
    it('should work', (done) => {
      let onCleanup
      const onCleanupSpy = jest.fn()
      const vm = new Vue({
        setup() {
          const count = ref(0)
          watchEffect((_onCleanup) => {
            onCleanup = _onCleanup
            _onCleanup(onCleanupSpy)
            spy(count.value)
          })

          return {
            count,
          }
        },
        render(h) {
          return h('div', this.count)
        },
      }).$mount()
      expect(spy).toHaveBeenCalled()
      waitForUpdate(() => {
        expect(onCleanup).toEqual(anyFn)
        expect(onCleanupSpy).toHaveBeenCalledTimes(0)
        expect(spy).toHaveBeenLastCalledWith(0)
        vm.count++
      })
        .then(() => {
          expect(spy).toHaveBeenLastCalledWith(1)
          expect(onCleanupSpy).toHaveBeenCalledTimes(1)
          vm.$destroy()
        })
        .then(() => {
          expect(onCleanupSpy).toHaveBeenCalledTimes(2)
        })
        .then(done)
    })

    it('sync=true', () => {
      const vm = new Vue({
        setup() {
          const count = ref(0)
          watchEffect(
            () => {
              spy(count.value)
            },
            {
              flush: 'sync',
            }
          )

          return {
            count,
          }
        },
      })
      expect(spy).toHaveBeenLastCalledWith(0)
      vm.count++
      expect(spy).toHaveBeenLastCalledWith(1)
    })
  })

  describe('Multiple sources', () => {
    let obj1, obj2
    it('do not store the intermediate state', (done) => {
      new Vue({
        setup() {
          obj1 = reactive({ a: 1 })
          obj2 = reactive({ a: 2 })
          watch([() => obj1.a, () => obj2.a], (n, o) => spy(n, o), {
            immediate: true,
          })
          return {
            obj1,
            obj2,
          }
        },
        template: `<div>{{obj1.a}} {{obj2.a}}</div>`,
      }).$mount()
      expect(spy).toBeCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith([1, 2], undefined)
      obj1.a = 2
      obj2.a = 3

      obj1.a = 3
      obj2.a = 4
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(2)
        expect(spy).toHaveBeenLastCalledWith([3, 4], [1, 2])
        obj2.a = 5
        obj2.a = 6
      })
        .then(() => {
          expect(spy).toBeCalledTimes(3)
          expect(spy).toHaveBeenLastCalledWith([3, 6], [3, 4])
        })
        .then(done)
    })

    it('basic usage(immediate=true, flush=none-sync)', (done) => {
      const vm = new Vue({
        setup() {
          const a = ref(1)
          const b = ref(1)
          watch([a, b], (n, o) => spy(n, o), { flush: 'post', immediate: true })

          return {
            a,
            b,
          }
        },
        template: `<div>{{a}} {{b}}</div>`,
      }).$mount()
      expect(spy).toBeCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith([1, 1], undefined)
      vm.a = 2
      expect(spy).toBeCalledTimes(1)
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(2)
        expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1])
        vm.a = 3
        vm.b = 3
      })
        .then(() => {
          expect(spy).toBeCalledTimes(3)
          expect(spy).toHaveBeenLastCalledWith([3, 3], [2, 1])
        })
        .then(done)
    })

    it('basic usage(immediate=false, flush=none-sync)', (done) => {
      const vm = new Vue({
        setup() {
          const a = ref(1)
          const b = ref(1)
          watch([a, b], (n, o) => spy(n, o), {
            immediate: false,
            flush: 'post',
          })

          return {
            a,
            b,
          }
        },
        template: `<div>{{a}} {{b}}</div>`,
      }).$mount()
      vm.a = 2
      expect(spy).not.toHaveBeenCalled()
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1])
        vm.a = 3
        vm.b = 3
      })
        .then(() => {
          expect(spy).toBeCalledTimes(2)
          expect(spy).toHaveBeenLastCalledWith([3, 3], [2, 1])
        })
        .then(done)
    })

    it('basic usage(immediate=true, flush=sync)', () => {
      const vm = new Vue({
        setup() {
          const a = ref(1)
          const b = ref(1)
          watch([a, b], (n, o) => spy(n, o), { immediate: true, flush: 'sync' })

          return {
            a,
            b,
          }
        },
      })
      expect(spy).toBeCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith([1, 1], undefined)
      vm.a = 2
      expect(spy).toBeCalledTimes(2)
      expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1])
      vm.a = 3
      vm.b = 3
      expect(spy.mock.calls.length).toBe(4)
      expect(spy).toHaveBeenNthCalledWith(3, [3, 1], [2, 1])
      expect(spy).toHaveBeenNthCalledWith(4, [3, 3], [3, 1])
    })

    it('basic usage(immediate=false, flush=sync)', () => {
      const vm = new Vue({
        setup() {
          const a = ref(1)
          const b = ref(1)
          watch([a, b], (n, o) => spy(n, o), { lazy: true, flush: 'sync' })

          return {
            a,
            b,
          }
        },
      })
      expect(spy).not.toHaveBeenCalled()
      vm.a = 2
      expect(spy).toBeCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith([2, 1], [1, 1])
      vm.a = 3
      vm.b = 3
      expect(spy).toBeCalledTimes(3)
      expect(spy).toHaveBeenNthCalledWith(2, [3, 1], [2, 1])
      expect(spy).toHaveBeenNthCalledWith(3, [3, 3], [3, 1])
    })
  })

  describe('Out of setup', () => {
    it('should work', (done) => {
      const obj = reactive({ a: 1 })
      watch(
        () => obj.a,
        (n, o) => spy(n, o),
        { immediate: true }
      )
      expect(spy).toHaveBeenLastCalledWith(1, undefined)
      obj.a = 2
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(2)
        expect(spy).toHaveBeenLastCalledWith(2, 1)
      }).then(done)
    })

    it('simple effect', (done) => {
      const obj = reactive({ a: 1 })
      watchEffect(() => spy(obj.a))
      expect(spy).toHaveBeenCalled()
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenLastCalledWith(1)
        obj.a = 2
      })
        .then(() => {
          expect(spy).toBeCalledTimes(2)
          expect(spy).toHaveBeenLastCalledWith(2)
        })
        .then(done)
    })
  })

  describe('cleanup', () => {
    function getAsyncValue(val) {
      let handle
      let resolve
      const p = new Promise((_resolve) => {
        resolve = _resolve
        handle = setTimeout(() => {
          resolve(val)
        }, 0)
      })

      p.cancel = () => {
        clearTimeout(handle)
        resolve('canceled')
      }
      return p
    }

    it('work with effect', (done) => {
      const id = ref(1)
      const promises = []
      watchEffect((onCleanup) => {
        const val = getAsyncValue(id.value)
        promises.push(val)
        onCleanup(() => {
          val.cancel()
        })
      })
      waitForUpdate(() => {
        id.value = 2
      })
        .thenWaitFor(async (next) => {
          const values = await Promise.all(promises)
          expect(values).toEqual(['canceled', 2])
          next()
        })
        .then(done)
    })

    it('run cleanup when watch stops (effect)', (done) => {
      const spy = jest.fn()
      const cleanup = jest.fn()
      const stop = watchEffect((onCleanup) => {
        spy()
        onCleanup(cleanup)
      })
      waitForUpdate(() => {
        expect(spy).toHaveBeenCalled()
        stop()
      })
        .then(() => {
          expect(cleanup).toHaveBeenCalled()
        })
        .then(done)
    })

    it('run cleanup when watch stops', () => {
      const id = ref(1)
      const spy = jest.fn()
      const cleanup = jest.fn()
      const stop = watch(
        id,
        (value, oldValue, onCleanup) => {
          spy(value)
          onCleanup(cleanup)
        },
        { immediate: true }
      )

      expect(spy).toHaveBeenCalledWith(1)
      stop()
      expect(cleanup).toHaveBeenCalled()
    })

    it('should not collect reactive in onCleanup', (done) => {
      const ref1 = ref(1)
      const ref2 = ref(1)
      watchEffect((onCleanup) => {
        spy(ref1.value)
        onCleanup(() => {
          ref2.value = ref2.value + 1
        })
      })
      waitForUpdate(() => {
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenLastCalledWith(1)
        ref1.value++
      })
        .then(() => {
          expect(spy).toBeCalledTimes(2)
          expect(spy).toHaveBeenLastCalledWith(2)
          ref2.value = 10
        })
        .then(() => {
          expect(spy).toBeCalledTimes(2)
        })
        .then(done)
    })

    it('work with callback ', (done) => {
      const id = ref(1)
      const promises = []
      watch(
        id,
        (newVal, oldVal, onCleanup) => {
          const val = getAsyncValue(newVal)
          promises.push(val)
          onCleanup(() => {
            val.cancel()
          })
        },
        { immediate: true }
      )
      id.value = 2
      waitForUpdate()
        .thenWaitFor(async (next) => {
          const values = await Promise.all(promises)
          expect(values).toEqual(['canceled', 2])
          next()
        })
        .then(done)
    })
  })

  it('should execute watch when new key is added', () => {
    const r = reactive({})

    const cb = jest.fn()

    watch(r, cb, { deep: true })

    set(r, 'a', 1)

    expect(cb).toHaveBeenCalled()
  })
})
