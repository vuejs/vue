var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')
var dirParser = require('../../../../src/parsers/directive')
var compile = require('../../../../src/compiler/compile')
var transclude = require('../../../../src/compiler/transclude')

if (_.inBrowser) {
  describe('Compile', function () {

    var vm, el, data, directiveTeardown
    beforeEach(function () {
      // We mock vms here so we can assert what the generated
      // linker functions do.
      el = document.createElement('div')
      data = {}
      directiveTeardown = jasmine.createSpy()
      vm = {
        _directives: [],
        _bindDir: function (name) {
          this._directives.push({
            name: name,
            _teardown: directiveTeardown
          })
        },
        $set: jasmine.createSpy(),
        $eval: function (value) {
          return data[value]
        },
        $interpolate: function (value) {
          return data[value]
        },
        $parent: {
          _directives: [],
          $get: function (v) {
            return 'from parent: ' + v
          }
        }
      }
      spyOn(vm, '_bindDir').and.callThrough()
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
      var options = _.mergeOptions(Vue.options, {
        directives: {
          a: defA,
          b: defB
        }
      })
      var linker = compile(el, options)
      expect(typeof linker).toBe('function')
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(4)
      expect(vm._bindDir).toHaveBeenCalledWith('a', el, descriptorB, defA, undefined)
      expect(vm._bindDir).toHaveBeenCalledWith('a', el.firstChild, descriptorA, defA, undefined)
      expect(vm._bindDir).toHaveBeenCalledWith('b', el.firstChild, descriptorB, defB, undefined)
      expect(vm._bindDir).toHaveBeenCalledWith('b', el.lastChild, descriptorB, defB, undefined)
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

    it('inline html', function () {
      data.html = '<div>yoyoyo</div>'
      el.innerHTML = '{{{html}}} {{{*html}}}'
      var htmlDef = Vue.options.directives.html
      var htmlDesc = dirParser.parse('html')[0]
      var linker = compile(el, Vue.options)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(1)
      var htmlArgs = vm._bindDir.calls.argsFor(0)
      expect(htmlArgs[0]).toBe('html')
      expect(htmlArgs[2]).toBe(htmlDesc)
      expect(htmlArgs[3]).toBe(htmlDef)
      // with placeholder comments & interpolated one-time html
      expect(el.innerHTML).toBe('<!--v-html--> <div>yoyoyo</div>')
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
      expect(vm._bindDir).toHaveBeenCalledWith('repeat', el.firstChild, descriptor, def, undefined)
    })

    it('custom element components', function () {
      var options = _.mergeOptions(Vue.options, {
        components: {
          'my-component': {}
        }
      })
      el.innerHTML = '<my-component><div v-a="b"></div></my-component>'
      var linker = compile(el, options)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(1)
      expect(vm._bindDir.calls.argsFor(0)[0]).toBe('component')
      expect(_.warn).not.toHaveBeenCalled()
    })

    it('attribute interpolation', function () {
      data['{{*b}}'] = 'B'
      el.innerHTML = '<div a="{{a}}" b="{{*b}}"></div>'
      var def = Vue.options.directives.attr
      var descriptor = dirParser.parse('a:a')[0]
      var linker = compile(el, Vue.options)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(1)
      expect(vm._bindDir).toHaveBeenCalledWith('attr', el.firstChild, descriptor, def)
      expect(el.firstChild.getAttribute('b')).toBe('B')
    })

    it('props', function () {
      var options = _.mergeOptions(Vue.options, {
        _asComponent: true,
        props: [
          'a',
          'data-some-attr',
          'some-other-attr',
          'multiple-attrs',
          'oneway',
          'with-filter',
          'camelCase'
        ]
      })
      var def = Vue.options.directives._prop
      el.setAttribute('a', '1')
      el.setAttribute('data-some-attr', '{{a}}')
      el.setAttribute('some-other-attr', '2')
      el.setAttribute('multiple-attrs', 'a {{b}} c')
      el.setAttribute('oneway', '{{*a}}')
      el.setAttribute('with-filter', '{{a | filter}}')
      transclude(el, options)
      var linker = compile(el, options)
      linker(vm, el)
      // should skip literals and one-time bindings
      expect(vm._bindDir.calls.count()).toBe(4)
      // data-some-attr
      var args = vm._bindDir.calls.argsFor(0)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].arg).toBe('someAttr')
      expect(args[2].expression).toBe('a')
      expect(args[3]).toBe(def)
      // multiple-attrs
      args = vm._bindDir.calls.argsFor(1)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].arg).toBe('multipleAttrs')
      expect(args[2].expression).toBe('"a "+(b)+" c"')
      expect(args[3]).toBe(def)
      // oneway
      args = vm._bindDir.calls.argsFor(2)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].arg).toBe('oneway')
      expect(args[2].oneWay).toBe(true)
      expect(args[2].expression).toBe('a')
      expect(args[3]).toBe(def)
      // with-filter
      args = vm._bindDir.calls.argsFor(3)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].arg).toBe('withFilter')
      expect(args[2].expression).toBe('this._applyFilter("filter",[a])')
      expect(args[3]).toBe(def)
      // camelCase should've warn
      expect(_.warn.calls.count()).toBe(1)
      // literal and one time should've called vm.$set
      expect(vm.$set).toHaveBeenCalledWith('a', '1')
      expect(vm.$set).toHaveBeenCalledWith('someOtherAttr', '2')
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

    it('partial compilation', function () {
      el.innerHTML = '<div v-attr="test:abc">{{bcd}}<p v-show="ok"></p></div>'
      var linker = compile(el, Vue.options, true)
      var decompile = linker(vm, el)
      expect(vm._directives.length).toBe(3)
      decompile()
      expect(directiveTeardown.calls.count()).toBe(3)
      expect(vm._directives.length).toBe(0)
    })

    it('skip script tags', function () {
      el.innerHTML = '<script type="x/template">{{test}}</script>'
      var linker = compile(el, Vue.options)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(0)
    })

    it('should handle nested transclusions', function (done) {
      vm = new Vue({
        el: el,
        template:
          '<testa>' +
            '<testb>' +
              '<div v-repeat="list">{{$value}}</div>' +
            '</testb>' +
          '</testa>',
        data: {
          list: [1,2]
        },
        components: {
          testa: { template: '<content></content>' },
          testb: { template: '<content></content>' }
        }
      })
      expect(el.innerHTML).toBe(
        '<testa><testb>' +
          '<div>1</div><div>2</div>' +
        '</testb></testa>'
      )
      vm.list.push(3)
      _.nextTick(function () {
        expect(el.innerHTML).toBe(
          '<testa><testb>' +
            '<div>1</div><div>2</div><div>3</div>' +
          '</testb></testa>'
        )
        done()
      })
    })

    it('should handle container/replacer directives with same name', function () {
      var parentSpy = jasmine.createSpy()
      var childSpy = jasmine.createSpy()
      vm = new Vue({
        el: el,
        template:
          '<test class="a" v-on="click:test(1)"></test>',
        methods: {
          test: parentSpy
        },
        components: {
          test: {
            template: '<div class="b" v-on="click:test(2)"></div>',
            replace: true,
            methods: {
              test: childSpy
            }
          }
        }
      })
      expect(vm.$el.firstChild.className).toBe('b a')
      var e = document.createEvent('HTMLEvents')
      e.initEvent('click', true, true)
      vm.$el.firstChild.dispatchEvent(e)
      expect(parentSpy).toHaveBeenCalledWith(1)
      expect(childSpy).toHaveBeenCalledWith(2)
    })

    it('should remove transcluded directives from parent when unlinking (v-component)', function () {
      var vm = new Vue({
        el: el,
        template:
          '<test>{{test}}</test>',
        data: {
          test: 'parent'
        },
        components: {
          test: {
            template: '<content></content>'
          }
        }
      })
      expect(vm.$el.textContent).toBe('parent')
      expect(vm._directives.length).toBe(2)
      expect(vm._children.length).toBe(1)
      vm._children[0].$destroy()
      expect(vm._directives.length).toBe(1)
      expect(vm._children.length).toBe(0)
    })

    it('should remove transcluded directives from parent when unlinking (v-if + v-component)', function (done) {
      var vm = new Vue({
        el: el,
        template:
          '<div v-if="ok">' +
            '<test>{{test}}</test>' +
          '</div>',
        data: {
          test: 'parent',
          ok: true
        },
        components: {
          test: {
            template: '<content></content>'
          }
        }
      })
      expect(vm.$el.textContent).toBe('parent')
      expect(vm._directives.length).toBe(3)
      expect(vm._children.length).toBe(1)
      vm.ok = false
      _.nextTick(function () {
        expect(vm.$el.textContent).toBe('')
        expect(vm._directives.length).toBe(1)
        expect(vm._children.length).toBe(0)
        done()
      })
    })

    it('element directive', function () {
      var vm = new Vue({
        el: el,
        template: '<test>{{a}}</test>',
        elementDirectives: {
          test: {
            bind: function () {
              this.el.setAttribute('test', '1')
            }
          }
        }
      })
      // should be terminal
      expect(el.innerHTML).toBe('<test test="1">{{a}}</test>')
    })

  })
}