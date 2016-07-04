var _ = require('src/util')
var Vue = require('src')
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

    it('format component name', function () {
      config.silent = false
      _.warn.and.callThrough()
      _.warn('oops', new Vue({ name: 'foo' }))
      expect(console.error).toHaveBeenCalledWith(warnPrefix + 'oops (found in component: <foo>)')
      _.warn('oops', { name: 'bar' })
      expect(console.error).toHaveBeenCalledWith(warnPrefix + 'oops (found in component: <bar>)')
    })

    it('not warn when silent is ture', function () {
      config.silent = true
      _.warn.and.callThrough()
      _.warn('oops')
      expect(console.error).not.toHaveBeenCalled()
    })
  })
}
