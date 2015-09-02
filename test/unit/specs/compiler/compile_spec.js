var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')
var dirParser = require('../../../../src/parsers/directive')
var newDirParser = require('../../../../src/parsers/directive-new')
var compiler = require('../../../../src/compiler')
var compile = compiler.compile
var internalDirectives = require('../../../../src/directives/internal')

if (_.inBrowser) {
  describe('Compile', function () {

    var vm, el, data, directiveBind, directiveTeardown
    beforeEach(function () {
      // We mock vms here so we can assert what the generated
      // linker functions do.
      el = document.createElement('div')
      data = {}
      directiveBind = jasmine.createSpy('bind')
      directiveTeardown = jasmine.createSpy('teardown')
      vm = {
        _data: {},
        _directives: [],
        _bindDir: function (name, node, desc, def) {
          this._directives.push({
            name: name,
            _def: def,
            _bind: function () {
              directiveBind(this.name)
            },
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
      el.innerHTML = '<p v-a="a" v-b="b">hello</p><div v-b:="b"></div>'
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
      expect(directiveBind.calls.count()).toBe(4)
      expect(vm._bindDir.calls.count()).toBe(4)
      expect(vm._bindDir).toHaveBeenCalledWith('a', el, descriptorB, defA, undefined, undefined, undefined, undefined, false)
      expect(vm._bindDir).toHaveBeenCalledWith('a', el.firstChild, descriptorA, defA, undefined, undefined, undefined, undefined, false)
      expect(vm._bindDir).toHaveBeenCalledWith('b', el.firstChild, descriptorB, defB, undefined, undefined, undefined, undefined, false)
      expect(vm._bindDir).toHaveBeenCalledWith('b', el.lastChild, descriptorB, defB, undefined, undefined, undefined, undefined, true)
      // check the priority sorting
      // the "b"s should be called first!
      expect(directiveBind.calls.argsFor(0)[0]).toBe('b')
      expect(directiveBind.calls.argsFor(1)[0]).toBe('b')
      expect(directiveBind.calls.argsFor(2)[0]).toBe('a')
      expect(directiveBind.calls.argsFor(3)[0]).toBe('a')
    })

    it('bind- syntax', function () {
      el.setAttribute('bind-class', 'a')
      el.setAttribute('bind-style', 'b')
      el.setAttribute('bind-title', 'c')
      var descA = newDirParser.parse('a')
      var descB = newDirParser.parse('b')
      var descC = newDirParser.parse('c')
      var linker = compile(el, Vue.options)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(3)
      expect(vm._bindDir).toHaveBeenCalledWith('class', el, descA, Vue.options.directives.class, undefined, undefined, undefined, undefined, undefined)
      expect(vm._bindDir).toHaveBeenCalledWith('style', el, descB, Vue.options.directives.style, undefined, undefined, undefined, undefined, undefined)
      expect(vm._bindDir).toHaveBeenCalledWith('attr', el, descC, Vue.options.directives.attr, undefined, undefined, undefined, 'title', undefined)
    })

    it('on- syntax', function () {
      el.setAttribute('on-click', 'a++')
      var desc = newDirParser.parse('a++')
      var linker = compile(el, Vue.options)
      linker(vm, el)
      expect(vm._bindDir.calls.count()).toBe(1)
      expect(vm._bindDir).toHaveBeenCalledWith('on', el, desc, Vue.options.directives.on, undefined, undefined, undefined, 'click', undefined)
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
        '<div v-for="item in items"><p v-a="b"></p></div>' + // v-for
        '<div v-pre><p v-a="b"></p></div>' // v-pre
      var def = Vue.options.directives.for
      var descriptor = dirParser.parse('item in items')[0]
      var linker = compile(el, Vue.options)
      linker(vm, el)
      // expect 1 call because terminal should return early and let
      // the directive handle the rest.
      expect(vm._bindDir.calls.count()).toBe(1)
      expect(vm._bindDir).toHaveBeenCalledWith('for', el.firstChild, descriptor, def, undefined, undefined, undefined)
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

    it('props', function () {
      var bindingModes = Vue.config._propBindingModes
      var props = [
        { name: 'testNormal' },
        { name: 'testLiteral' },
        { name: 'testTwoWay' },
        { name: 'twoWayWarn' },
        { name: 'testOneTime' },
        { name: 'optimizeLiteral' }
      ]
      el.setAttribute('bind-test-normal', 'a')
      el.setAttribute('test-literal', '1')
      el.setAttribute('bind-optimize-literal', '1')
      el.setAttribute('bind-test-two-way', '@a')
      el.setAttribute('bind-two-way-warn', '@a + 1')
      el.setAttribute('bind-test-one-time', '*a')
      compiler.compileAndLinkProps(vm, el, props)
      expect(vm._bindDir.calls.count()).toBe(3) // skip literal and one time
      // literal
      expect(vm.testLiteral).toBe(1)
      expect(vm._data.testLiteral).toBe(1)
      expect(vm.optimizeLiteral).toBe(1)
      expect(vm._data.optimizeLiteral).toBe(1)
      // one time
      expect(vm.testOneTime).toBe('from parent: a')
      expect(vm._data.testOneTime).toBe('from parent: a')
      // normal
      var args = vm._bindDir.calls.argsFor(0)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].path).toBe('testNormal')
      expect(args[2].parentPath).toBe('a')
      expect(args[2].mode).toBe(bindingModes.ONE_WAY)
      // two way
      args = vm._bindDir.calls.argsFor(1)
      expect(args[0]).toBe('prop')
      expect(args[1]).toBe(null)
      expect(args[2].path).toBe('testTwoWay')
      expect(args[2].parentPath).toBe('a')
      expect(args[2].mode).toBe(bindingModes.TWO_WAY)
      // two way warn
      expect(hasWarned(_, 'non-settable parent path')).toBe(true)
    })

    it('props on root instance', function () {
      // temporarily remove vm.$parent
      var context = vm._context
      vm._context = null
      el.setAttribute('prop-a', '"hi"')
      el.setAttribute('prop-b', 'hi')
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
      el.innerHTML = '<div bind-test="abc">{{bcd}}<p v-show="ok"></p></div>'
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
          '<test class="a" on-click="test(1)"></test>',
        methods: {
          test: parentSpy
        },
        components: {
          test: {
            template: '<div class="b" on-click="test(2)"></div>',
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
        template: '<test prop-msg="msg"></test>',
        data: {
          msg: 'hi'
        },
        components: {
          test: {
            props: ['msg'],
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
            template: '<slot></slot>'
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
            template: '<slot></slot>'
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
