var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')
var transition = require('../../../../src/transition')
var def = require('../../../../src/directives/hide')

if (_.inBrowser) {
  describe('v-hide', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(transition, 'apply').and.callThrough()
    })

    it('should work', function () {
      var dir = {
        el: el,
        update: def,
        vm: new Vue()
      }
      dir.update(false)
      expect(el.style.display).toBe('')
      dir.update(true)
      expect(el.style.display).toBe('none')
      expect(transition.apply).toHaveBeenCalled()
    })
  })
}
