var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')
var dirParser = require('../../../../src/parse/directive')
var merge = require('../../../../src/util/merge-option')
var compile = require('../../../../src/compile/compile')

if (_.inBrowser) {
  describe('Compile', function () {

    var vm, el, data
    beforeEach(function () {
      // We mock vms here so we can assert what the generated
      // linker functions do.
      el = document.createElement('div')
      data = {}
      vm = {
        _bindDir: jasmine.createSpy(),
        $set: jasmine.createSpy(),
        $eval: function (value) {
          return data[value]
        },
        $interpolate: function (value) {
          value = value.replace(/\{|\}/g, '')
          return data[value]
        }
      }
      spyOn(vm, '$eval').and.callThrough()
      spyOn(vm, '$interpolate').and.callThrough()
    })

    it('normal directives', function () {
      var defA = { priority: 1 }
      var defB = { priority: 2 }
      var descriptorA = dirParser.parse('a')[0]
      var descriptorB = dirParser.parse('b')[0]
      var options = merge(Vue.options, {
        directives: {
          a: defA,
          b: defB
        }
      })
      el.innerHTML = '<p v-a="a" v-b="b"></p><div v-b="b"></div>'
      var linker = compile(el, options)
      expect(typeof linker).toBe('function')
      // should remove attributes
      expect(el.firstChild.attributes.length).toBe(0)
      expect(el.lastChild.attributes.length).toBe(0)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(3)
      expect(vm._bindDir).toHaveBeenCalledWith('a', el.firstChild, descriptorA, defA)
      expect(vm._bindDir).toHaveBeenCalledWith('b', el.firstChild, descriptorB, defB)
      expect(vm._bindDir).toHaveBeenCalledWith('b', el.lastChild, descriptorB, defB)
      // check the priority sorting
      // the "b" on the firstNode should be called first!
      expect(vm._bindDir.calls.argsFor(0)[0]).toBe('b')
    })

    it('terminal directives', function () {
      // body...
    })

    it('text interpolation', function () {
      // body...
    })

    it('attribute interpolation', function () {
      // body...
    })

    it('param attributes', function () {
      // body...
    })

    it('DocumentFragment', function () {
      // body...
    })

    it('template elements', function () {
      // body...
    })

  })
}