import Vue from 'vue'

describe('Options watch', () => {
  let spy
  beforeEach(() => {
    spy = jasmine.createSpy('watch')
  })

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
    const spy1 = jasmine.createSpy('watch')
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
      data: { a: { b: 1 }},
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
    }).then(() => {
      expect(spy).toHaveBeenCalledWith(vm.a, oldA)
    }).then(done)
  })
})
