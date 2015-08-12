var _ = require('../../../../src/util')
var def = require('../../../../src/directives/attr')

if (_.inBrowser) {
  describe('v-attr', function () {

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
      expect(dir.el.hasAttribute('value')).toBe(false)
      expect(dir.el.value).toBe('what')
      dir.el = document.createElement('input')
      dir.el.type = 'checkbox'
      dir.arg = 'checked'
      expect(dir.el.checked).toBe(false)
      dir.update(true)
      expect(dir.el.checked).toBe(true)
    })

    it('xlink', function () {
      var xlinkNS = 'http://www.w3.org/1999/xlink'
      dir.arg = 'xlink:special'

      dir.update('ok')
      expect(el.getAttributeNS(xlinkNS, 'special')).toBe('ok')
      dir.update('again')
      expect(el.getAttributeNS(xlinkNS, 'special')).toBe('again')
      dir.update(null)
      expect(el.hasAttributeNS(xlinkNS, 'special')).toBe(false)
    })

    it('object and xlink', function () {
      var xlinkNS = 'http://www.w3.org/1999/xlink'
      var obj1 = {special: 'ok', test: 'again'}
      var obj2 = {'xlink:href': '#', test: 'ok', empty: null}
      dir.update(obj2)
      expect(el.getAttributeNS(xlinkNS, 'href')).toBe('#')
      expect(el.getAttribute('test')).toBe('ok')
      expect(el.hasAttribute('empty')).toBe(false)
      dir.update(obj1)
      expect(el.hasAttributeNS(xlinkNS, 'href')).toBe(false)
      expect(el.getAttribute('special')).toBe('ok')
      expect(el.getAttribute('test')).toBe('again')
      obj1.test = null
      dir.update(obj1)
      expect(el.hasAttribute('test')).toBe(false)
      dir.update(obj2)
      expect(el.getAttributeNS(xlinkNS, 'href')).toBe('#')
    })
  })
}
