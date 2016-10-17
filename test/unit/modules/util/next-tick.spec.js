import { nextTick } from 'core/util/env'

describe('nextTick', () => {
  it('accepts a callback', done => {
    nextTick(done)
  })

  it('returns undefined when passed a callback', () => {
    expect(typeof nextTick(() => {})).toBe('undefined')
  })

  if (typeof Promise === 'undefined') {
    it('raises an error when provided no callback with no Promise support', () => {
      spyOn(console, 'error')
      nextTick()
      expect(console.error).toHaveBeenCalledWith('Vue.nextTick requires a callback as its first argument or an environment that supports Promises')
    })
  } else {
    it('returns a Promise when provided no callback', done => {
      nextTick().then(done)
    })

    it('returns a Promise with a context argument when provided a falsy callback and an object', done => {
      const obj = {}
      nextTick(undefined, obj).then(ctx => {
        expect(ctx).toBe(obj)
        done()
      })
    })
  }
})
