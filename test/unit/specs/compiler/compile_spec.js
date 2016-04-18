var Vue = require('src')
var _ = require('src/util')
var FragmentFactory = require('src/fragment/factory')
var compiler = require('src/compiler')
var compile = compiler.compile
var publicDirectives = require('src/directives/public')
var internalDirectives = require('src/directives/internal')

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
      $options: {},
      _data: {},
      _directives: [],
      _bindDir: function (descriptor, node) {
        this._directives.push({
          name: descriptor.name,
          descriptor: descriptor,
          _bind: function () {
            directiveBind(this.name)
          },
          _teardown: directiveTeardown
        })
      },
      $get: function (exp) {
        return (new Vue()).$get(exp)
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
  })

  it('normal directives', function () {
    el.setAttribute('v-a', 'b')
    el.innerHTML = '<p v-a:hello.a.b="a" v-b="1">hello</p><div v-b.literal="foo"></div>'
    var defA = { priority: 1 }
    var defB = { priority: 2 }
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

    // check if we are in firefox, which has different
    // attribute interation order
    var isAttrReversed = el.firstChild.attributes[0].name === 'v-b'

    // 1
    var args = vm._bindDir.calls.argsFor(0)
    expect(args[0].name).toBe('a')
    expect(args[0].expression).toBe('b')
    expect(args[0].def).toBe(defA)
    expect(args[1]).toBe(el)
    // 2
    args = vm._bindDir.calls.argsFor(isAttrReversed ? 2 : 1)
    expect(args[0].name).toBe('a')
    expect(args[0].expression).toBe('a')
    expect(args[0].def).toBe(defA)
    // args + multiple modifiers
    expect(args[0].arg).toBe('hello')
    expect(args[0].modifiers.a).toBe(true)
    expect(args[0].modifiers.b).toBe(true)
    expect(args[1]).toBe(el.firstChild)
    // 3 (expression literal)
    args = vm._bindDir.calls.argsFor(isAttrReversed ? 1 : 2)
    expect(args[0].name).toBe('b')
    expect(args[0].expression).toBe('1')
    expect(args[0].def).toBe(defB)
    expect(args[1]).toBe(el.firstChild)
    // 4 (explicit literal)
    args = vm._bindDir.calls.argsFor(3)
    expect(args[0].name).toBe('b')
    expect(args[0].expression).toBe('foo')
    expect(args[0].def).toBe(defB)
    expect(args[0].modifiers.literal).toBe(true)
    expect(args[1]).toBe(el.lastChild)
    // check the priority sorting
    // the "b"s should be called first!
    expect(directiveBind.calls.argsFor(0)[0]).toBe('b')
    expect(directiveBind.calls.argsFor(1)[0]).toBe('b')
    expect(directiveBind.calls.argsFor(2)[0]).toBe('a')
    expect(directiveBind.calls.argsFor(3)[0]).toBe('a')
  })

  it('v-bind shorthand', function () {
    el.setAttribute(':class', 'a')
    el.setAttribute(':style', 'b')
    el.setAttribute(':title', 'c')

    // The order of setAttribute is not guaranteed to be the same with
    // the order of attribute enumberation, therefore we need to save
    // it here!
    var descriptors = {
      ':class': {
        name: 'class',
        attr: ':class',
        expression: 'a',
        def: internalDirectives.class
      },
      ':style': {
        name: 'style',
        attr: ':style',
        expression: 'b',
        def: internalDirectives.style
      },
      ':title': {
        name: 'bind',
        attr: ':title',
        expression: 'c',
        arg: 'title',
        def: publicDirectives.bind
      }
    }
    var expects = [].map.call(el.attributes, function (attr) {
      return descriptors[attr.name]
    })

    var linker = compile(el, Vue.options)
    linker(vm, el)
    expect(vm._bindDir.calls.count()).toBe(3)

    expects.forEach(function (e, i) {
      var args = vm._bindDir.calls.argsFor(i)
      for (var key in e) {
        expect(args[0][key]).toBe(e[key])
      }
      expect(args[1]).toBe(el)
    })
  })

  it('v-on shorthand', function () {
    el.innerHTML = '<div @click="a++"></div>'
    el = el.firstChild
    var linker = compile(el, Vue.options)
    linker(vm, el)
    expect(vm._bindDir.calls.count()).toBe(1)
    var args = vm._bindDir.calls.argsFor(0)
    expect(args[0].name).toBe('on')
    expect(args[0].expression).toBe('a++')
    expect(args[0].arg).toBe('click')
    expect(args[0].def).toBe(publicDirectives.on)
    expect(args[1]).toBe(el)
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
    expect(args[0].name).toBe('text')
    expect(args[0].expression).toBe('a')
    expect(args[0].def).toBe(def)
    // skip the node because it's generated in the linker fn via cloneNode
    // expect $eval to be called during onetime
    expect(vm.$eval).toHaveBeenCalledWith('b')
    // {{a}} is mocked so it's a space.
    // but we want to make sure {{*b}} worked.
    expect(el.innerHTML).toBe('  and yeah')
  })

  it('text interpolation, adjacent nodes', function () {
    data.b = 'yeah'
    el.appendChild(document.createTextNode('{{a'))
    el.appendChild(document.createTextNode('}} and {{'))
    el.appendChild(document.createTextNode('*b}}'))
    var def = Vue.options.directives.text
    var linker = compile(el, Vue.options)
    linker(vm, el)
    // expect 1 call because one-time bindings do not generate a directive.
    expect(vm._bindDir.calls.count()).toBe(1)
    var args = vm._bindDir.calls.argsFor(0)
    expect(args[0].name).toBe('text')
    expect(args[0].expression).toBe('a')
    expect(args[0].def).toBe(def)
    // skip the node because it's generated in the linker fn via cloneNode
    // expect $eval to be called during onetime
    expect(vm.$eval).toHaveBeenCalledWith('b')
    // {{a}} is mocked so it's a space.
    // but we want to make sure {{*b}} worked.
    expect(el.innerHTML).toBe('  and yeah')
  })

  it('adjacent text nodes with no interpolation', function () {
    el.appendChild(document.createTextNode('a'))
    el.appendChild(document.createTextNode('b'))
    el.appendChild(document.createTextNode('c'))
    var linker = compile(el, Vue.options)
    linker(vm, el)
    expect(el.innerHTML).toBe('abc')
  })

  it('inline html', function () {
    data.html = '<div>foo</div>'
    el.innerHTML = '{{{html}}} {{{*html}}}'
    var htmlDef = Vue.options.directives.html
    var linker = compile(el, Vue.options)
    linker(vm, el)
    expect(vm._bindDir.calls.count()).toBe(1)
    var htmlArgs = vm._bindDir.calls.argsFor(0)
    expect(htmlArgs[0].name).toBe('html')
    expect(htmlArgs[0].expression).toBe('html')
    expect(htmlArgs[0].def).toBe(htmlDef)
    // with placeholder comments & interpolated one-time html
    expect(el.innerHTML).toBe('<!--v-html--> <div>foo</div>')
  })

  it('terminal directives', function () {
    el.innerHTML =
      '<div v-for="item in items"><p v-a="b"></p></div>' + // v-for
      '<div v-pre><p v-a="b"></p></div>' // v-pre
    var def = Vue.options.directives.for
    var linker = compile(el, Vue.options)
    linker(vm, el)
    // expect 1 call because terminal should return early and let
    // the directive handle the rest.
    expect(vm._bindDir.calls.count()).toBe(1)
    var args = vm._bindDir.calls.argsFor(0)
    expect(args[0].name).toBe('for')
    expect(args[0].expression).toBe('item in items')
    expect(args[0].def).toBe(def)
    expect(args[1]).toBe(el.firstChild)
  })

  it('custom terminal directives', function () {
    var defTerminal = {
      terminal: true,
      priority: Vue.options.directives.if.priority + 1
    }
    var options = _.mergeOptions(Vue.options, {
      directives: { term: defTerminal }
    })
    el.innerHTML = '<div v-term:arg1.modifier1.modifier2="foo"></div>'
    var linker = compile(el, options)
    linker(vm, el)
    expect(vm._bindDir.calls.count()).toBe(1)
    var args = vm._bindDir.calls.argsFor(0)
    expect(args[0].name).toBe('term')
    expect(args[0].expression).toBe('foo')
    expect(args[0].attr).toBe('v-term:arg1.modifier1.modifier2')
    expect(args[0].arg).toBe('arg1')
    expect(args[0].modifiers.modifier1).toBe(true)
    expect(args[0].modifiers.modifier2).toBe(true)
    expect(args[0].def).toBe(defTerminal)
  })

  it('custom terminal directives priority', function () {
    var defTerminal = {
      terminal: true,
      priority: Vue.options.directives.if.priority + 1
    }
    var options = _.mergeOptions(Vue.options, {
      directives: { term: defTerminal }
    })
    el.innerHTML = '<div v-term:arg1 v-if="ok"></div>'
    var linker = compile(el, options)
    linker(vm, el)
    expect(vm._bindDir.calls.count()).toBe(1)
    var args = vm._bindDir.calls.argsFor(0)
    expect(args[0].name).toBe('term')
    expect(args[0].expression).toBe('')
    expect(args[0].attr).toBe('v-term:arg1')
    expect(args[0].arg).toBe('arg1')
    expect(args[0].def).toBe(defTerminal)
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
    var args = vm._bindDir.calls.argsFor(0)
    expect(args[0].name).toBe('component')
    expect(args[0].expression).toBe('my-component')
    expect(args[0].modifiers.literal).toBe(true)
    expect(args[0].def).toBe(internalDirectives.component)
    expect(getWarnCount()).toBe(0)
  })

  it('props', function () {
    var bindingModes = Vue.config._propBindingModes
    var props = {
      testNormal: null,
      testLiteral: null,
      testBoolean: { type: Boolean },
      testTwoWay: null,
      twoWayWarn: null,
      testOneTime: null,
      optimizeLiteral: null,
      optimizeLiteralStr: null,
      optimizeLiteralNegativeNumber: null,
      literalWithFilter: null
    }
    el.innerHTML = '<div ' +
      'v-bind:test-normal="a" ' +
      'test-literal="1" ' +
      'test-boolean ' +
      ':optimize-literal="1" ' +
      ':optimize-literal-str="\'true\'"' +
      ':optimize-literal-negative-number="-1"' +
      ':test-two-way.sync="a" ' +
      ':two-way-warn.sync="a + 1" ' +
      ':test-one-time.once="a" ' +
      ':literal-with-filter="\'FOO\' | lowercase"' +
      '></div>'
    compiler.compileAndLinkProps(vm, el.firstChild, props)
    // check bindDir calls:
    // skip literal and one time, but not literal with filter
    expect(vm._bindDir.calls.count()).toBe(4)
    // literal
    expect(vm.testLiteral).toBe('1')
    expect(vm.testBoolean).toBe(true)
    expect(vm.optimizeLiteral).toBe(1)
    expect(vm.optimizeLiteralStr).toBe('true')
    expect(vm.optimizeLiteralNegativeNumber).toBe(-1)
    // one time
    expect(vm.testOneTime).toBe('from parent: a')
    // normal
    var args = vm._bindDir.calls.argsFor(0)
    var prop = args[0].prop
    expect(args[0].name).toBe('prop')
    expect(prop.path).toBe('testNormal')
    expect(prop.parentPath).toBe('a')
    expect(prop.mode).toBe(bindingModes.ONE_WAY)
    // two way
    args = vm._bindDir.calls.argsFor(1)
    prop = args[0].prop
    expect(args[0].name).toBe('prop')
    expect(prop.path).toBe('testTwoWay')
    expect(prop.parentPath).toBe('a')
    expect(prop.mode).toBe(bindingModes.TWO_WAY)
    // two way warn
    expect('non-settable parent path').toHaveBeenWarned()
    // literal with filter
    args = vm._bindDir.calls.argsFor(3)
    prop = args[0].prop
    expect(args[0].name).toBe('prop')
    expect(prop.path).toBe('literalWithFilter')
    expect(prop.parentPath).toBe("'FOO'")
    expect(prop.filters.length).toBe(1)
    expect(prop.mode).toBe(bindingModes.ONE_WAY)
  })

  it('props on root instance', function () {
    // temporarily remove vm.$parent
    var context = vm._context
    vm._context = null
    el.setAttribute('v-bind:a', '"foo"')
    el.setAttribute(':b', '[1,2,3]')
    compiler.compileAndLinkProps(vm, el, { a: null, b: null })
    expect(vm._bindDir.calls.count()).toBe(0)
    expect(vm.a).toBe('foo')
    expect(vm.b.join(',')).toBe('1,2,3')
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
    el.innerHTML = '<div v-bind:test="abc">{{bcd}}<p v-show="ok"></p></div>'
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
        '<test class="a" v-on:click="test(1)"></test>',
      methods: {
        test: parentSpy
      },
      components: {
        test: {
          template: '<div class="b" v-on:click="test(2)"></div>',
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
      template: '<test :msg="msg"></test>',
      data: {
        msg: 'foo'
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
          template: 'foo'
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

  it('attribute interpolation', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div id="{{a}}" class="b bla-{{c}} d"></div>',
      data: {
        a: 'aaa',
        c: 'ccc'
      }
    })
    expect(el.firstChild.id).toBe('aaa')
    expect(el.firstChild.className).toBe('b bla-ccc d')
    vm.a = 'aa'
    vm.c = 'cc'
    _.nextTick(function () {
      expect(el.firstChild.id).toBe('aa')
      expect(el.firstChild.className).toBe('b bla-cc d')
      done()
    })
  })

  it('attribute interpolation: one-time', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div id="{{a}} b {{*c}}"></div>',
      data: {
        a: 'aaa',
        c: 'ccc'
      }
    })
    expect(el.firstChild.id).toBe('aaa b ccc')
    vm.a = 'aa'
    vm.c = 'cc'
    _.nextTick(function () {
      expect(el.firstChild.id).toBe('aa b ccc')
      done()
    })
  })

  it('attribute interpolation: special cases', function () {
    new Vue({
      el: el,
      template: '<label for="{{a}}" data-test="{{b}}"></label><form accept-charset="{{c}}"></form>',
      data: {
        a: 'aaa',
        b: 'bbb',
        c: 'UTF-8'
      }
    })
    expect(el.innerHTML).toBe('<label for="aaa" data-test="bbb"></label><form accept-charset="UTF-8"></form>')
  })

  it('attribute interpolation: warn invalid', function () {
    new Vue({
      el: el,
      template: '<div v-text="{{a}}"></div>',
      data: {
        a: '123'
      }
    })
    expect(el.innerHTML).toBe('<div></div>')
    expect('attribute interpolation is not allowed in Vue.js directives').toHaveBeenWarned()
  })

  it('attribute interpolation: warn mixed usage with v-bind', function () {
    new Vue({
      el: el,
      template: '<div class="{{a}}" :class="bcd"></div>',
      data: {
        a: 'foo'
      }
    })
    expect('Do not mix mustache interpolation and v-bind').toHaveBeenWarned()
  })

  it('warn directives on fragment instances', function () {
    new Vue({
      el: el,
      template: '<test id="foo" class="ok" :prop="123"></test>',
      components: {
        test: {
          replace: true,
          props: ['prop'],
          template: '{{prop}}'
        }
      }
    })
    expect(getWarnCount()).toBe(1)
    expect([
      'Attributes "id", "class" are ignored on component <test>',
      'Attributes "class", "id" are ignored on component <test>'
    ]).toHaveBeenWarned()
  })

  it('should compile component container directives using correct context', function () {
    new Vue({
      el: el,
      directives: {
        test: {
          bind: function () {
            this.el.textContent = 'worked!'
          }
        }
      },
      template: '<comp v-test></comp>',
      components: { comp: { template: '<div></div>' }}
    })
    expect(el.textContent).toBe('worked!')
    expect(getWarnCount()).toBe(0)
  })

  // #xxx
  it('should compile build-in terminal directive wihtout loop', function (done) {
    var vm = new Vue({
      el: el,
      data: { show: false },
      template: '<p v-if:arg1.modifier1="show">hello world</p>'
    })
    vm.show = true
    _.nextTick(function () {
      expect(el.textContent).toBe('hello world')
      done()
    })
  })

  it('should compile custom terminal directive wihtout loop', function (done) {
    var vm = new Vue({
      el: el,
      data: { show: false },
      template: '<p v-if="show" v-inject:modal.modifier1="foo">hello world</p>',
      directives: {
        inject: {
          terminal: true,
          priority: Vue.options.directives.if.priority + 1,
          bind: function () {
            this.anchor = _.createAnchor('v-inject')
            _.replace(this.el, this.anchor)
            var factory = new FragmentFactory(this.vm, this.el)
            this.frag = factory.create(this._host, this._scope, this._frag)
            this.frag.before(this.anchor)
          },
          unbind: function () {
            this.frag.remove()
            _.replace(this.anchor, this.el)
          }
        }
      }
    })
    vm.show = true
    _.nextTick(function () {
      expect(el.textContent).toBe('hello world')
      done()
    })
  })
})
