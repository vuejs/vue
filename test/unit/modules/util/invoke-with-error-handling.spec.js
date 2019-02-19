import Vue from 'vue'
import { invokeWithErrorHandling } from 'core/util/error'

describe('invokeWithErrorHandling', () => {
  if (typeof Promise !== 'undefined') {
    it('nested calls do not trigger multiple errorHandler calls', done => {
      let times = 0

      Vue.config.errorHandler = function () {
        times++
      }

      invokeWithErrorHandling(() => {
        return invokeWithErrorHandling(() => {
          return Promise.reject(new Error('fake error'))
        })
      }).catch(() => {
        expect(times).toBe(1)
        done()
      })
    })
  }
})
