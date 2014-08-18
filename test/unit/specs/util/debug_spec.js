var _ = require('../../../../src/util')
var config = require('../../../../src/config')
config.silent = true

if (typeof console !== 'undefined') {

  describe('Util - Debug', function () {

    beforeEach(function () {
      spyOn(console, 'log')
      spyOn(console, 'warn')
      if (console.trace) {
        spyOn(console, 'trace')
      }
    })
    
    it('log when debug is true', function () {
      config.debug = true
      _.log('hello', 'world')
      expect(console.log).toHaveBeenCalledWith('hello', 'world')
    })

    it('not log when debug is false', function () {
      config.debug = false
      _.log('bye', 'world')
      expect(console.log.calls.count()).toBe(0)
    })

    it('warn when silent is false', function () {
      config.silent = false
      _.warn('oops', 'ops')
      expect(console.warn).toHaveBeenCalledWith('oops', 'ops')
    })

    it('not warn when silent is ture', function () {
      config.silent = true
      _.warn('oops', 'ops')
      expect(console.warn.calls.count()).toBe(0)
    })

    if (console.trace) {
      it('trace when not silent and debugging', function () {
        config.debug = true
        config.silent = false
        _.warn('haha')
        expect(console.trace).toHaveBeenCalled()
        config.debug = false
        config.silent = true
      })
    }
  })
}