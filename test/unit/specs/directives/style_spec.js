var _ = require('../../../../src/util')
var def = require('../../../../src/directives/style')

if (_.inBrowser) {
  describe('v-style', function () {

    var el, dir
    beforeEach(function () {
      el = document.createElement('div')
      dir = { el: el }
      _.extend(dir, def)      
    })

    it('normal with arg', function () {
      dir.arg = 'color'
      dir.bind()
      dir.update('red')
      expect(el.style.color).toBe('red')
    })

    it('normal no arg', function () {
      dir.bind()
      dir.update('color:red;')
      expect(el.style.cssText.replace(/\s/g, '')).toBe('color:red;')
    })

    it('!important', function () {
      dir.arg = 'color'
      dir.bind()
      dir.update('red !important;')
      expect(el.style.getPropertyPriority('color')).toBe('important')
    })

    it('auto prefixing', function () {
      var spy = el.style.setProperty = jasmine.createSpy()
      dir.arg = '$transform'
      dir.bind()
      var val = 'scale(0.5)'
      dir.update(val)
      expect(spy).toHaveBeenCalledWith('transform', val, '')
      expect(spy).toHaveBeenCalledWith('-ms-transform', val, '')
      expect(spy).toHaveBeenCalledWith('-moz-transform', val, '')
      expect(spy).toHaveBeenCalledWith('-webkit-transform', val, '')
    })

  })
}