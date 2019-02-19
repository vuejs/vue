import Vue from 'vue'
import { invokeWithErrorHandling } from 'core/util/error'

describe('invokeWithErrorHandling', () => {
  if (typeof Promise !== 'undefined') {
    it('should errorHandler call once when nested calls return rejected promise', done => {
      let times = 0

      Vue.config.errorHandler = function () {
        times++
      }

      invokeWithErrorHandling(() => {
        return invokeWithErrorHandling(() => {
          return Promise.reject(new Error('fake error'))
        })
      }).then(() => {
        expect(times).toBe(1)
        done()
      })
    })
  }
})
