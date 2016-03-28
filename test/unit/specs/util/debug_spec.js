var _ = require('src/util')
var config = require('src/config')
var warnPrefix = '[Vue warn]: '

if (typeof console !== 'undefined') {
  describe('Util - Debug', function () {
    beforeEach(function () {
      spyOn(console, 'error')
    })

    it('warn when silent is false', function () {
      config.silent = false
      _.warn.and.callThrough()
      _.warn('oops')
      expect(console.error).toHaveBeenCalledWith(warnPrefix + 'oops')
    })

    it('not warn when silent is ture', function () {
      config.silent = true
      _.warn.and.callThrough()
      _.warn('oops')
      expect(console.error).not.toHaveBeenCalled()
    })
  })
}
