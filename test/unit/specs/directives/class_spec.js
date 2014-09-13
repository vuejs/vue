var _ = require('../../../../src/util')
var def = require('../../../../src/directives/class')

if (_.inBrowser) {
  describe('v-class', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
    })

    it('with className', function () {
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

    it('without className', function () {
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

  })
}