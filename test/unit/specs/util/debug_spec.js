var _ = require('../../../../src/util')
var config = require('../../../../src/config')
var infoPrefix = '[Vue info]: '
var warnPrefix = '[Vue warn]: '
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
      _.log('hello')
      expect(console.log).toHaveBeenCalledWith(infoPrefix + 'hello')
    })

    it('not log when debug is false', function () {
      config.debug = false
      _.log('bye')
      expect(console.log).not.toHaveBeenCalled()
    })

    it('warn when silent is false', function () {
      config.silent = false
      _.warn('oops')
      expect(console.warn).toHaveBeenCalledWith(warnPrefix + 'oops')
    })

    it('not warn when silent is ture', function () {
      config.silent = true
      _.warn('oops')
      expect(console.warn).not.toHaveBeenCalled()
    })

  })
}