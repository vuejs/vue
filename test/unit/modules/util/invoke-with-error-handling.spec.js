import Vue from 'vue'
import { invokeWithErrorHandling } from 'core/util/error'

describe('invokeWithErrorHandling', () => {
  if (typeof Promise !== 'undefined') {
    it('should errorHandler call once when nested calls return rejected promise', done => {
      const originalHandler = Vue.config.errorHandler
      const handler = Vue.config.errorHandler = jasmine.createSpy()

      invokeWithErrorHandling(() => {
        return invokeWithErrorHandling(() => {
          return Promise.reject(new Error('fake error'))
        })
      }).then(() => {
        Vue.config.errorHandler = originalHandler
        expect(handler.calls.count()).toBe(1)
        done()
      })
    })
  }
})
