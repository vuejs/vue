import Vue from 'vue'

describe('Global config', () => {
  it('should warn replacing config object', () => {
    const originalConfig = Vue.config
    Vue.config = {}
    expect(Vue.config).toBe(originalConfig)
    expect('Do not replace the Vue.config object').toHaveBeenWarned()
  })

  describe('silent', () => {
    it('should be false by default', () => {
      Vue.util.warn('foo')
      expect('foo').toHaveBeenWarned()
    })

    it('should work when set to true', () => {
      Vue.config.silent = true
      Vue.util.warn('foo')
      expect('foo').not.toHaveBeenWarned()
      Vue.config.silent = false
    })
  })

  describe('errorHandler', () => {
    it('should be called with correct args', () => {
      const spy = jasmine.createSpy('errorHandler')
      Vue.config.errorHandler = spy
      const err = new Error()
      const vm = new Vue({
        render () { throw err }
      }).$mount()
      expect(spy).toHaveBeenCalledWith(err, vm)
      Vue.config.errorHandler = null
    })
  })

  describe('optionMergeStrategies', () => {
    it('should allow defining custom option merging strategies', () => {
      const spy = jasmine.createSpy('option merging')
      Vue.config.optionMergeStrategies.__test__ = (parent, child, vm) => {
        spy(parent, child, vm)
        return child + 1
      }
      const Test = Vue.extend({
        __test__: 1
      })
      expect(spy.calls.count()).toBe(1)
      expect(spy).toHaveBeenCalledWith(undefined, 1, undefined)
      expect(Test.options.__test__).toBe(2)
      const test = new Test({
        __test__: 2
      })
      expect(spy.calls.count()).toBe(2)
      expect(spy).toHaveBeenCalledWith(2, 2, test)
      expect(test.$options.__test__).toBe(3)
    })
  })
})
