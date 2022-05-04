import Vue from 'vue'
import { invokeWithErrorHandling } from 'core/util/error'

describe('invokeWithErrorHandling', () => {
  if (typeof Promise !== 'undefined') {
    it('should errorHandler call once when nested calls return rejected promise', done => {
      const originalHandler = Vue.config.errorHandler
      const handler = Vue.config.errorHandler = jasmine.createSpy()
      const userCatch = jasmine.createSpy()
      const err = new Error('fake error')

      invokeWithErrorHandling(() => {
        return invokeWithErrorHandling(() => {
          return Promise.reject(err)
        })
      }).catch(userCatch).then(() => {
        Vue.config.errorHandler = originalHandler
        expect(handler.calls.count()).toBe(1)
        expect(userCatch).toHaveBeenCalledWith(err)
        done()
      })
    })
  }
})
