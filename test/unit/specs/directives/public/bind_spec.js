var _ = require('../../../../../src/util')
var def = require('../../../../../src/directives/public/bind')
var xlinkNS = 'http://www.w3.org/1999/xlink'

if (_.inBrowser) {
  describe('v-bind', function () {

    var el, dir
    beforeEach(function () {
      el = document.createElement('div')
      dir = {el: el}
      _.extend(dir, def)
    })

    it('normal attr', function () {
      dir.arg = 'test'
      dir.update('ok')
      expect(el.getAttribute('test')).toBe('ok')
      dir.update('again')
      expect(el.getAttribute('test')).toBe('again')
      dir.update(null)
      expect(el.hasAttribute('test')).toBe(false)
      dir.update(false)
      expect(el.hasAttribute('test')).toBe(false)
      dir.update(0)
      expect(el.getAttribute('test')).toBe('0')
    })

    it('should set property for input value', function () {
      dir.el = document.createElement('input')
      dir.arg = 'value'
      dir.update('what')
      expect(dir.el.value).toBe('what')
      dir.el = document.createElement('input')
      dir.el.type = 'checkbox'
      dir.arg = 'checked'
      expect(dir.el.checked).toBe(false)
      dir.update(true)
      expect(dir.el.checked).toBe(true)
    })

    it('xlink', function () {
      dir.arg = 'xlink:special'
      dir.update('ok')
      expect(el.getAttributeNS(xlinkNS, 'special')).toBe('ok')
      dir.update('again')
      expect(el.getAttributeNS(xlinkNS, 'special')).toBe('again')
      dir.update(null)
      expect(el.hasAttributeNS(xlinkNS, 'special')).toBe(false)
    })

    it('object format', function () {
      dir.el = document.createElement('input')
      dir.update({
        'test': 'hi',
        'value': 'what'
      })
      expect(dir.el.getAttribute('test')).toBe('hi')
      expect(dir.el.value).toBe('what')
      dir.update({
        'xlink:special': 'ok'
      })
      expect(dir.el.hasAttribute('test')).toBe(false)
      expect(dir.el.value).toBeFalsy()
      expect(dir.el.getAttributeNS(xlinkNS, 'special')).toBe('ok')
      dir.update(null)
      expect(dir.el.hasAttributeNS(xlinkNS, 'special')).toBe(false)
    })
  })
}
