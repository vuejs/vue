var _ = require('../../../../src/util')
var def = require('../../../../src/directives/style')
var Vue = require('../../../../src/vue')

function checkPrefixedProp (prop) {
  var el = document.createElement('div')
  var upper = prop.charAt(0).toUpperCase() + prop.slice(1)
  if (!(prop in el.style)) {
    var prefixes = ['Webkit', 'Moz', 'ms']
    var i = prefixes.length
    while (i--) {
      if ((prefixes[i] + upper) in el.style) {
        prop = prefixes[i] + upper
      }
    }  
  }
  return prop
}

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
      dir.update('red')
      expect(el.style.color).toBe('red')
    })

    it('normal no arg', function () {
      dir.update('color:red;')
      expect(el.style.cssText.replace(/\s/g, '')).toBe('color:red;')
    })

    it('!important', function () {
      dir.arg = 'color'
      dir.update('red !important;')
      expect(el.style.getPropertyPriority('color')).toBe('important')
    })

    it('camel case', function () {
      dir.arg = 'marginLeft'
      dir.update('30px')
      expect(el.style.marginLeft).toBe('30px')
    })

    it('remove on falsy value', function () {
      el.style.color = 'red'
      dir.arg = 'color'
      dir.update(null)
      expect(el.style.color).toBe('')
    })

    it('ignore unsupported property', function () {
      dir.arg = 'unsupported'
      dir.update('test')
      expect(el.style.unsupported).not.toBe('test')
    })

    it('auto prefixing', function () {
      var prop = checkPrefixedProp('transform')
      dir.arg = 'transform'
      var val = 'scale(0.5)'
      dir.update(val)
      expect(el.style[prop]).toBe(val)
    })

    it('update with object', function () {
      dir.update({color: 'red', marginRight: '30px'})
      expect(el.style.getPropertyValue('color')).toBe('red')
      expect(el.style.getPropertyValue('margin-right')).toBe('30px')
    })

    it('update with object and auto prefix', function () {
      var prop = checkPrefixedProp('transform')
      var val = 'scale(0.5)';
      dir.update({transform: val})
      expect(el.style[prop]).toBe(val)
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