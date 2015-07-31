var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')
var dirParser = require('../../../../src/parsers/directive')
var compiler = require('../../../../src/compiler')
var compile = compiler.compile

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
        _data: {},
        _directives: [],
        _bindDir: function (name) {
          this._directives.push({
            name: name,
            _teardown: directiveTeardown
          })
        },
        $eval: function (value) {
          return data[value]
        },
        $interpolate: function (value) {
          return data[value]
        },
        _context: {
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
      var bindingModes = Vue.config._propBindingModes
      var props = [
        'a',
        'empty',
        'data-some-attr',
        'some-other-attr',
        'multiple-attrs',
        'onetime',
        'twoway',
        'with-filter',
        'camelCase',
        'boolean-literal',
        {
          name: 'default-value',
          default: 123
        },
        {
          name: 'boolean',
          type: Boolean
        },
        {
          name: 'boolean-absent',
          type: Boolean
        },
        {
          name: 'factory',
          type: Object,
          default: function () {
            return {
              a: 123
            }
          }
        },
        'withDataPrefix',
        {
          name: 'forceTwoWay',
          twoWay: true
        }
      ].map(function (p) {
        return typeof p === 'string' ? { name: p } : p
      })
      var def = Vue.options.directives._prop
      el.setAttribute('a', '1')
      el.setAttribute('empty', '')
      el.setAttribute('data-some-attr', '{{a}}')
      el.setAttribute('some-other-attr', '2')
      el.setAttribute('multiple-attrs', 'a {{b}} c')
      el.setAttribute('onetime', '{{*a}}')
      el.setAttribute('twoway', '{{@a}}')
      el.setAttribute('with-filter', '{{a | filter}}')
      el.setAttribute('camel-case', 'hi')
      el.setAttribute('boolean-literal', '{{true}}')
      el.setAttribute('boolean', '')
      el.setAttribute('data-with-data-prefix', '1')
      el.setAttribute('force-two-way', '{{a}}')
      compiler.compileAndLinkProps(vm, el, props)
      // should skip literals and one-time bindings
      expect(vm._bindDir.calls.count()).toBe(5)
      // data-some-attr
      var args = vm._bindDir.calls.argsFor(0)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].path).toBe('someAttr')
      expect(args[2].parentPath).toBe('a')
      expect(args[2].mode).toBe(bindingModes.ONE_WAY)
      expect(args[3]).toBe(def)
      // multiple-attrs
      args = vm._bindDir.calls.argsFor(1)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].path).toBe('multipleAttrs')
      expect(args[2].parentPath).toBe('"a "+(b)+" c"')
      expect(args[2].mode).toBe(bindingModes.ONE_WAY)
      expect(args[3]).toBe(def)
      // two way
      args = vm._bindDir.calls.argsFor(2)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].path).toBe('twoway')
      expect(args[2].mode).toBe(bindingModes.TWO_WAY)
      expect(args[2].parentPath).toBe('a')
      expect(args[3]).toBe(def)
      // with-filter
      args = vm._bindDir.calls.argsFor(3)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].path).toBe('withFilter')
      expect(args[2].parentPath).toBe('this._applyFilters(a,null,[{"name":"filter"}],false)')
      expect(args[2].mode).toBe(bindingModes.ONE_WAY)
      expect(args[3]).toBe(def)
      // warn when expecting two-way binding but not getting it
      expect(hasWarned(_, 'expects a two-way binding type')).toBe(true)
      // literal and one time should've been set on the _data
      // and numbers should be casted
      expect(Object.keys(vm._data).length).toBe(11)
      expect(vm.a).toBe(1)
      expect(vm._data.a).toBe(1)
      expect(vm.empty).toBe('')
      expect(vm._data.empty).toBe('')
      expect(vm.someOtherAttr).toBe(2)
      expect(vm._data.someOtherAttr).toBe(2)
      expect(vm.onetime).toBe('from parent: a')
      expect(vm._data.onetime).toBe('from parent: a')
      expect(vm.booleanLiteral).toBe('from parent: true')
      expect(vm._data.booleanLiteral).toBe('from parent: true')
      expect(vm.camelCase).toBe('hi')
      expect(vm._data.camelCase).toBe('hi')
      expect(vm.defaultValue).toBe(123)
      expect(vm._data.defaultValue).toBe(123)
      expect(vm.boolean).toBe(true)
      expect(vm._data.boolean).toBe(true)
      expect(vm.booleanAbsent).toBe(false)
      expect(vm._data.booleanAbsent).toBe(false)
      expect(vm.factory).toBe(vm._data.factory)
      expect(vm.factory.a).toBe(123)
      expect(vm.withDataPrefix).toBe(1)
      expect(vm._data.withDataPrefix).toBe(1)
    })

    it('props on root instance', function () {
      // temporarily remove vm.$parent
      var context = vm._context
      vm._context = null
      el.setAttribute('a', 'hi')
      el.setAttribute('b', '{{hi}}')
      compiler.compileAndLinkProps(vm, el, [
        { name: 'a' },
        { name: 'b' }
      ])
      expect(vm._bindDir.calls.count()).toBe(0)
      expect(vm._data.a).toBe('hi')
      expect(hasWarned(_, 'Cannot bind dynamic prop on a root')).toBe(true)
      // restore parent mock
      vm._context = context
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

    it('should teardown props and replacer directives when unlinking', function () {
      var vm = new Vue({
        el: el,
        template: '<test prop="{{msg}}"></test>',
        data: {
          msg: 'hi'
        },
        components: {
          test: {
            props: ['prop'],
            template: '<div v-show="true"></div>',
            replace: true
          }
        }
      })
      var dirs = vm.$children[0]._directives
      expect(dirs.length).toBe(2)
      vm.$children[0].$destroy()
      var i = dirs.length
      while (i--) {
        expect(dirs[i]._bound).toBe(false)
      }
    })

    it('should remove parent container directives from parent when unlinking', function () {
      var vm = new Vue({
        el: el,
        template:
          '<test v-show="ok"></test>',
        data: {
          ok: true
        },
        components: {
          test: {
            template: 'hi'
          }
        }
      })
      expect(el.firstChild.style.display).toBe('')
      expect(vm._directives.length).toBe(2)
      expect(vm.$children.length).toBe(1)
      vm.$children[0].$destroy()
      expect(vm._directives.length).toBe(1)
      expect(vm.$children.length).toBe(0)
    })

    it('should remove transcluded directives from parent when unlinking (component)', function () {
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
      expect(vm.$children.length).toBe(1)
      vm.$children[0].$destroy()
      expect(vm._directives.length).toBe(1)
      expect(vm.$children.length).toBe(0)
    })

    it('should remove transcluded directives from parent when unlinking (v-if + component)', function (done) {
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
      expect(vm.$children.length).toBe(1)
      vm.ok = false
      _.nextTick(function () {
        expect(vm.$el.textContent).toBe('')
        expect(vm._directives.length).toBe(1)
        expect(vm.$children.length).toBe(0)
        done()
      })
    })

    it('element directive', function () {
      new Vue({
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
