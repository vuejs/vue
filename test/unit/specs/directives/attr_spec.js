var _ = require('../../../../src/util')
var def = require('../../../../src/directives/attr')

if (_.inBrowser) {
  describe('v-attr', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
    })

    it('normal attr', function () {
      var dir = {
        el: el,
        arg: 'test'
      }
      _.extend(dir, def)
      dir.bind()
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

    it('xlink', function () {
      var xlinkNS = 'http://www.w3.org/1999/xlink'
      var dir = {
        el: el,
        arg: 'xlink:href'
      }
      _.extend(dir, def)
      dir.bind()
      dir.update('ok')
      expect(el.getAttributeNS(xlinkNS, 'href')).toBe('ok')
      dir.update('again')
      expect(el.getAttributeNS(xlinkNS, 'href')).toBe('again')
      dir.update(null)
      expect(el.hasAttributeNS(xlinkNS, 'test')).toBe(false)
    })

  })
}