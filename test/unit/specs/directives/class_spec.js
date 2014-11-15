var _ = require('../../../../src/util')
var def = require('../../../../src/directives/class')

if (_.inBrowser) {
  describe('v-class', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
    })

    it('single with className', function () {
      el.className = 'haha'
      var dir = {
        el: el,
        arg: 'test',
        update: def
      }
      dir.update(true)
      expect(el.className).toBe('haha test')
      dir.update(false)
      expect(el.className).toBe('haha')
    })

    it('single without className', function () {
      el.className = 'haha'
      var dir = {
        el: el,
        update: def
      }
      dir.update('test')
      expect(el.className).toBe('haha test')
      dir.update('what')
      expect(el.className).toBe('haha what')
      dir.update()
      expect(el.className).toBe('haha')
    })

    it('multiple with className', function () {
      el.className = 'haha'
      var dir = {
        el: el,
        arg: 'test test2',
        update: def
      }
      dir.update(true)
      expect(el.className).toBe('haha test test2')
      dir.update(false)
      expect(el.className).toBe('haha')
    })

    it('multiple without className', function () {
      el.className = 'haha'
      var dir = {
        el: el,
        update: def
      }
      dir.update('test test2')
      expect(el.className).toBe('haha test test2')
      dir.update('what what2')
      expect(el.className).toBe('haha what what2')
      dir.update()
      expect(el.className).toBe('haha')
    })
  })
}
