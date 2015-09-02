var _ = require('../../../../../src/util')
var def = require('../../../../../src/directives/public/text')

if (_.inBrowser) {
  describe('v-text', function () {

    it('element', function () {
      var dir = {
        el: document.createElement('div')
      }
      _.extend(dir, def)
      dir.bind()
      dir.update('hi')
      expect(dir.el.textContent).toBe('hi')
      dir.update(123)
      expect(dir.el.textContent).toBe('123')
    })

    it('text node', function () {
      var dir = {
        el: document.createTextNode(' ')
      }
      _.extend(dir, def)
      dir.bind()
      dir.update('hi')
      expect(dir.el.nodeValue).toBe('hi')
      dir.update(123)
      expect(dir.el.nodeValue).toBe('123')
    })
  })
}
