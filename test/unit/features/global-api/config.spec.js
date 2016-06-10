import Vue from 'vue'

describe('Global config', () => {
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
})
