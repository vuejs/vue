var _ = require('../../../../src/util')
var def = require('../../../../src/directives/style')
var Vue = require('../../../../src/vue')

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

    it('update with object', function () {
      dir.bind()
      dir.update({color: 'red', 'margin-right': '30px'})
      expect(el.style.getPropertyValue('color')).toBe('red')
      expect(el.style.getPropertyValue('margin-right')).toBe('30px')
    })

    it('update with object and auto prefix', function () {
      var spy = el.style.setProperty = jasmine.createSpy()
      dir.bind()
      var scale = 'scale(0.5)';
      dir.update({'$transform': scale})
      expect(spy).toHaveBeenCalledWith('transform', scale, '')
      expect(spy).toHaveBeenCalledWith('-ms-transform', scale, '')
      expect(spy).toHaveBeenCalledWith('-moz-transform', scale, '')
      expect(spy).toHaveBeenCalledWith('-webkit-transform', scale, '')
    })

    it('updates object deep', function (done) {
      el.setAttribute('v-style', 'divStyling')
      var vm = new Vue({
        el: el,
        data: {divStyling: { display: 'none'}}
      })
      expect(el.style.display).toBe('none')
      vm.divStyling.display = 'block'
      _.nextTick(function () {
        expect(el.style.display).toBe('block')
        done()
      })
    })

  })
}