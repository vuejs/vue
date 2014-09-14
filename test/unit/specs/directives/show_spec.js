var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')
var transition = require('../../../../src/transition')
var def = require('../../../../src/directives/show')

if (_.inBrowser) {
  describe('v-show', function () {

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
      expect(el.style.display).toBe('none')
      dir.update(true)
      expect(el.style.display).toBe('')
      expect(transition.apply).toHaveBeenCalled()
    })

  })
}