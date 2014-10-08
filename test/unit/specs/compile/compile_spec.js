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
          return data[value]
        }
      }
      spyOn(vm, '$eval').and.callThrough()
      spyOn(vm, '$interpolate').and.callThrough()
      spyOn(_, 'warn')
    })

    it('normal directives', function () {
      el.setAttribute('v-a', 'b')
      el.innerHTML = '<p v-a="a" v-b="b">hello</p><div v-b="b"></div>'
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
      var linker = compile(el, options)
      expect(typeof linker).toBe('function')
      // should remove attributes
      expect(el.attributes.length).toBe(0)
      expect(el.firstChild.attributes.length).toBe(0)
      expect(el.lastChild.attributes.length).toBe(0)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(4)
      expect(vm._bindDir).toHaveBeenCalledWith('a', el, descriptorB, defA)
      expect(vm._bindDir).toHaveBeenCalledWith('a', el.firstChild, descriptorA, defA)
      expect(vm._bindDir).toHaveBeenCalledWith('b', el.firstChild, descriptorB, defB)
      expect(vm._bindDir).toHaveBeenCalledWith('b', el.lastChild, descriptorB, defB)
      // check the priority sorting
      // the "b" on the firstNode should be called first!
      expect(vm._bindDir.calls.argsFor(1)[0]).toBe('b')
    })

    it('text interpolation', function () {
      data.b = 'yeah'
      el.innerHTML = '{{a}} and {{*b}}'
      var def = Vue.options.directives.text
      var linker = compile(el, Vue.options)
      linker(vm, el)
      // expect 1 call because one-time bindings do not generate a directive.
      expect(vm._bindDir.calls.count()).toBe(1)
      var args = vm._bindDir.calls.argsFor(0)
      expect(args[0]).toBe('text')
      // skip the node because it's generated in the linker fn via cloneNode
      expect(args[2]).toBe(dirParser.parse('a')[0])
      expect(args[3]).toBe(def)
      // expect $eval to be called during onetime
      expect(vm.$eval).toHaveBeenCalledWith('b')
      // {{a}} is mocked so it's a space.
      // but we want to make sure {{*b}} worked.
      expect(el.innerHTML).toBe('  and yeah')
    })

    it('inline html and partial', function () {
      data.html = 'yoyoyo'
      el.innerHTML = '{{{html}}} {{{*html}}} {{>partial}}'
      var htmlDef = Vue.options.directives.html
      var partialDef = Vue.options.directives.partial
      var htmlDesc = dirParser.parse('html')[0]
      var partialDesc = dirParser.parse('partial')[0]
      var linker = compile(el, Vue.options)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(2)
      var htmlArgs = vm._bindDir.calls.argsFor(0)
      expect(htmlArgs[0]).toBe('html')
      expect(htmlArgs[2]).toBe(htmlDesc)
      expect(htmlArgs[3]).toBe(htmlDef)
      var partialArgs = vm._bindDir.calls.argsFor(1)
      expect(partialArgs[0]).toBe('partial')
      expect(partialArgs[2]).toBe(partialDesc)
      expect(partialArgs[3]).toBe(partialDef)
      expect(vm.$eval).toHaveBeenCalledWith('html')
      // with placeholder comments & interpolated one-time html
      expect(el.innerHTML).toBe('<!--v-html--> yoyoyo <!--v-partial-->')
    })

    it('terminal directives', function () {
      el.innerHTML =
        '<div v-repeat="items"><p v-a="b"></p></div>' + // v-repeat
        '<div v-pre><p v-a="b"></p></div>' // v-pre
      var def = Vue.options.directives.repeat
      var descriptor = dirParser.parse('items')[0]
      var linker = compile(el, Vue.options)
      linker(vm, el)
      // expect 1 call because terminal should return early and let
      // the directive handle the rest.
      expect(vm._bindDir.calls.count()).toBe(1)
      expect(vm._bindDir).toHaveBeenCalledWith('repeat', el.firstChild, descriptor, def)
    })

    it('custom element components', function () {
      var options = merge(Vue.options, {
        components: {
          'my-component': {}
        }
      })
      el.innerHTML = '<my-component><div v-a="b"></div></my-component>'
      var def = Vue.options.directives.component
      var descriptor = dirParser.parse('my-component')[0]
      var linker = compile(el, options)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(1)
      expect(vm._bindDir).toHaveBeenCalledWith('component', el.firstChild, descriptor, def)
      expect(_.warn).not.toHaveBeenCalled()
    })

    it('attribute interpolation', function () {
      data['{{*b}}'] = 'B'
      el.innerHTML = '<div a="{{a}}" b="{{*b}}"></div>'
      var def = Vue.options.directives.attr
      var descriptor = dirParser.parse('a:(a)')[0]
      var linker = compile(el, Vue.options)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(1)
      expect(vm._bindDir).toHaveBeenCalledWith('attr', el.firstChild, descriptor, def)
      expect(el.firstChild.getAttribute('b')).toBe('B')
    })

    it('param attributes', function () {
      var options = merge(Vue.options, {
        paramAttributes: ['a', 'b', 'c']
      })
      var def = Vue.options.directives['with']
      el.setAttribute('a', '1')
      el.setAttribute('b', '{{a}}')
      el.setAttribute('c', 'a {{b}} c') // invalid
      var linker = compile(el, options)
      linker(vm, el)
      // should skip literal & invliad
      expect(vm._bindDir.calls.count()).toBe(1)
      var args = vm._bindDir.calls.argsFor(0)
      expect(args[0]).toBe('with')
      expect(args[1]).toBe(el)
      // skipping descriptor because it's ducked inline
      expect(args[3]).toBe(def)
      // invalid should've warn
      expect(_.warn).toHaveBeenCalled()
      // literal should've called vm.$set
      expect(vm.$set).toHaveBeenCalledWith('a', '1')
    })

    it('DocumentFragment', function () {
      var frag = document.createDocumentFragment()
      frag.appendChild(el)
      var el2 = document.createElement('div')
      frag.appendChild(el2)
      el.innerHTML = '{{*a}}'
      el2.innerHTML = '{{*b}}'
      data.a = 'A'
      data.b = 'B'
      var linker = compile(frag, Vue.options)
      linker(vm, frag)
      expect(el.innerHTML).toBe('A')
      expect(el2.innerHTML).toBe('B')
    })

  })
}