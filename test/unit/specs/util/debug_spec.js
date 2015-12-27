var _ = require('src/util')
var config = require('src/config')
var warnPrefix = '[Vue warn]: '

if (typeof console !== 'undefined') {

  describe('Util - Debug', function () {

    beforeEach(function () {
      spyOn(console, 'log')
      spyOn(console, 'warn')
      if (console.trace) {
        spyOn(console, 'trace')
      }
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
