import Vue from 'vue'
import testObjectOption from '../../../helpers/test-object-option'

describe('Options watch', () => {
  let spy
  beforeEach(() => {
    spy = vi.fn()
  })

  testObjectOption('watch')

  it('basic usage', done => {
    const vm = new Vue({
      data: {
        a: 1
      },
      watch: {
        a: spy
      }
    })
    expect(spy).not.toHaveBeenCalled()
    vm.a = 2
    expect(spy).not.toHaveBeenCalled()
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(2, 1)
    }).then(done)
  })

  it('string method name', done => {
    const vm = new Vue({
      data: {
        a: 1
      },
      watch: {
        a: 'onChange'
      },
      methods: {
        onChange: spy
      }
    })
    expect(spy).not.toHaveBeenCalled()
    vm.a = 2
    expect(spy).not.toHaveBeenCalled()
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(2, 1)
    }).then(done)
  })

  it('multiple cbs (after option merge)', done => {
    const spy1 = vi.fn()
    const Test = Vue.extend({
      watch: {
        a: spy1
      }
    })
    const vm = new Test({
      data: { a: 1 },
      watch: {
        a: spy
      }
    })
    vm.a = 2
    waitForUpdate(() => {
      expect(spy1).toHaveBeenCalledWith(2, 1)
      expect(spy).toHaveBeenCalledWith(2, 1)
    }).then(done)
  })

  it('with option: immediate', done => {
    const vm = new Vue({
      data: { a: 1 },
      watch: {
        a: {
          handler: spy,
          immediate: true
        }
      }
    })
    expect(spy).toHaveBeenCalledWith(1)
    vm.a = 2
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(2, 1)
    }).then(done)
  })

  it('with option: deep', done => {
    const vm = new Vue({
      data: { a: { b: 1 } },
      watch: {
        a: {
          handler: spy,
          deep: true
        }
      }
    })
    const oldA = vm.a
    expect(spy).not.toHaveBeenCalled()
    vm.a.b = 2
    expect(spy).not.toHaveBeenCalled()
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(vm.a, vm.a)
      vm.a = { b: 3 }
    })
      .then(() => {
        expect(spy).toHaveBeenCalledWith(vm.a, oldA)
      })
      .then(done)
  })

  it('correctly merges multiple extends', done => {
    const spy2 = vi.fn()
    const spy3 = vi.fn()
    const A = Vue.extend({
      data: function () {
        return {
          a: 0,
          b: 0
        }
      },
      watch: {
        b: spy
      }
    })

    const B = Vue.extend({
      extends: A,
      watch: {
        a: spy2
      }
    })

    const C = Vue.extend({
      extends: B,
      watch: {
        a: spy3
      }
    })

    const vm = new C()
    vm.a = 1

    waitForUpdate(() => {
      expect(spy).not.toHaveBeenCalled()
      expect(spy2).toHaveBeenCalledWith(1, 0)
      expect(spy3).toHaveBeenCalledWith(1, 0)
    }).then(done)
  })

  it('should support watching unicode paths', done => {
    const vm = new Vue({
      data: {
        数据: 1
      },
      watch: {
        数据: spy
      }
    })
    expect(spy).not.toHaveBeenCalled()
    vm['数据'] = 2
    expect(spy).not.toHaveBeenCalled()
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(2, 1)
    }).then(done)
  })

  it('should not warn proper usage', () => {
    new Vue({
      data: {
        foo: { _bar: 1 }, // element has such watchers...
        prop1: 123
      },
      watch: {
        'foo._bar': () => {},
        prop1() {}
      }
    })
    expect(`Failed watching path`).not.toHaveBeenWarned()
  })
})
