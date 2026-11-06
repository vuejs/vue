import Vue from 'vue'

describe('Instance methods data', () => {
  it('$set/$delete', done => {
    const vm = new Vue({
      template: '<div>{{ a.msg }}</div>',
      data: {
        a: {}
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('')
    vm.$set(vm.a, 'msg', 'hello')
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('hello')
      vm.$delete(vm.a, 'msg')
    })
      .then(() => {
        expect(vm.$el.innerHTML).toBe('')
      })
      .then(done)
  })

  describe('$watch', () => {
    let vm, spy
    beforeEach(() => {
      spy = vi.fn()
      vm = new Vue({
        data: {
          a: {
            b: 1
          },
          유니코드: {
            なまえ: 'ok'
          }
        },
        methods: {
          foo: spy
        }
      })
    })

    it('basic usage', done => {
      vm.$watch('a.b', spy)
      vm.a.b = 2
      waitForUpdate(() => {
        expect(spy.mock.calls.length).toBe(1)
        expect(spy).toHaveBeenCalledWith(2, 1)
        vm.a = { b: 3 }
      })
        .then(() => {
          expect(spy.mock.calls.length).toBe(2)
          expect(spy).toHaveBeenCalledWith(3, 2)
        })
        .then(done)
    })

    it('immediate', () => {
      vm.$watch('a.b', spy, { immediate: true })
      expect(spy.mock.calls.length).toBe(1)
      expect(spy).toHaveBeenCalledWith(1)
    })

    it('unwatch', done => {
      const unwatch = vm.$watch('a.b', spy)
      unwatch()
      vm.a.b = 2
      waitForUpdate(() => {
        expect(spy.mock.calls.length).toBe(0)
      }).then(done)
    })

    it('function watch', done => {
      vm.$watch(function () {
        return this.a.b
      }, spy)
      vm.a.b = 2
      waitForUpdate(() => {
        expect(spy).toHaveBeenCalledWith(2, 1)
      }).then(done)
    })

    it('deep watch', done => {
      const oldA = vm.a
      vm.$watch('a', spy, { deep: true })
      vm.a.b = 2
      waitForUpdate(() => {
        expect(spy).toHaveBeenCalledWith(oldA, oldA)
        vm.a = { b: 3 }
      })
        .then(() => {
          expect(spy).toHaveBeenCalledWith(vm.a, oldA)
        })
        .then(done)
    })

    it('handler option', done => {
      const oldA = vm.a
      vm.$watch('a', {
        handler: spy,
        deep: true
      })
      vm.a.b = 2
      waitForUpdate(() => {
        expect(spy).toHaveBeenCalledWith(oldA, oldA)
        vm.a = { b: 3 }
      })
        .then(() => {
          expect(spy).toHaveBeenCalledWith(vm.a, oldA)
        })
        .then(done)
    })

    it('handler option in string', () => {
      vm.$watch('a.b', {
        handler: 'foo',
        immediate: true
      })
      expect(spy.mock.calls.length).toBe(1)
      expect(spy).toHaveBeenCalledWith(1)
    })

    it('handler option in string', () => {
      vm.$watch('유니코드.なまえ', {
        handler: 'foo',
        immediate: true
      })
      expect(spy.mock.calls.length).toBe(1)
      expect(spy).toHaveBeenCalledWith('ok')
    })

    it('warn expression', () => {
      vm.$watch('a + b', spy)
      expect(
        'Watcher only accepts simple dot-delimited paths'
      ).toHaveBeenWarned()
    })
  })
})
