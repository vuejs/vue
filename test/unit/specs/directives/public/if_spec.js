var Vue = require('src')
var nextTick = Vue.nextTick

describe('v-if', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('normal', function (done) {
    var vm = new Vue({
      el: el,
      data: { test: false, a: 'A' },
      template: '<div v-if="test"><test :a="a"></test></div>',
      components: {
        test: {
          props: ['a'],
          template: '{{a}}'
        }
      }
    })
    // lazy instantitation
    expect(el.innerHTML).toBe('')
    expect(vm.$children.length).toBe(0)
    vm.test = true
    nextTick(function () {
      expect(el.innerHTML).toBe('<div><test>A</test></div>')
      expect(vm.$children.length).toBe(1)
      vm.test = false
      nextTick(function () {
        expect(el.innerHTML).toBe('')
        expect(vm.$children.length).toBe(0)
        vm.test = true
        nextTick(function () {
          expect(el.innerHTML).toBe('<div><test>A</test></div>')
          expect(vm.$children.length).toBe(1)
          var child = vm.$children[0]
          vm.$destroy()
          expect(child._isDestroyed).toBe(true)
          done()
        })
      })
    })
  })

  it('template block', function (done) {
    var vm = new Vue({
      el: el,
      data: { test: false, a: 'A', b: 'B' },
      template: '<template v-if="test"><p>{{a}}</p><p>{{b}}</p></template>'
    })
    // lazy instantitation
    expect(el.innerHTML).toBe('')
    vm.test = true
    nextTick(function () {
      expect(el.innerHTML).toBe('<p>A</p><p>B</p>')
      vm.test = false
      nextTick(function () {
        expect(el.innerHTML).toBe('')
        done()
      })
    })
  })

  it('v-if + component', function (done) {
    var attachSpy = jasmine.createSpy()
    var detachSpy = jasmine.createSpy()
    var readySpy = jasmine.createSpy()
    var vm = new Vue({
      el: el,
      data: { ok: false },
      template: '<test v-if="ok"></test>',
      components: {
        test: {
          data: function () {
            return { a: 123 }
          },
          template: '{{a}}',
          ready: readySpy,
          attached: attachSpy,
          detached: detachSpy
        }
      }
    })
    vm.$appendTo(document.body)
    expect(el.innerHTML).toBe('')
    expect(vm.$children.length).toBe(0)
    vm.ok = true
    nextTick(function () {
      expect(el.innerHTML).toBe('<test>123</test>')
      expect(vm.$children.length).toBe(1)
      expect(attachSpy).toHaveBeenCalled()
      expect(readySpy).toHaveBeenCalled()
      vm.ok = false
      nextTick(function () {
        expect(detachSpy).toHaveBeenCalled()
        expect(el.innerHTML).toBe('')
        expect(vm.$children.length).toBe(0)
        vm.$remove()
        done()
      })
    })
  })

  it('v-if + dynamic component', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        ok: false,
        view: 'view-a'
      },
      template: '<component :is="view" v-if="ok"></component>',
      components: {
        'view-a': {
          template: 'foo'
        },
        'view-b': {
          template: 'bar'
        }
      }
    })
    expect(el.innerHTML).toBe('')
    expect(vm.$children.length).toBe(0)
    // toggle if with lazy instantiation
    vm.ok = true
    nextTick(function () {
      expect(el.innerHTML).toBe('<component>foo</component>')
      expect(vm.$children.length).toBe(1)
      // switch view when if=true
      vm.view = 'view-b'
      nextTick(function () {
        expect(el.innerHTML).toBe('<component>bar</component>')
        expect(vm.$children.length).toBe(1)
        // toggle if when already instantiated
        vm.ok = false
        nextTick(function () {
          expect(el.innerHTML).toBe('')
          expect(vm.$children.length).toBe(0)
          // toggle if and switch view at the same time
          vm.view = 'view-a'
          vm.ok = true
          nextTick(function () {
            expect(el.innerHTML).toBe('<component>foo</component>')
            expect(vm.$children.length).toBe(1)
            done()
          })
        })
      })
    })
  })

  it('v-if with different truthy values', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        a: 1
      },
      template: '<div v-if="a">{{a}}</div>'
    })
    expect(el.innerHTML).toBe('<div>1</div>')
    vm.a = 2
    nextTick(function () {
      expect(el.innerHTML).toBe('<div>2</div>')
      done()
    })
  })

  it('invalid warn', function () {
    el.setAttribute('v-if', 'test')
    new Vue({
      el: el
    })
    expect('cannot be used on an instance root element').toHaveBeenWarned()
  })

  it('call attach/detach for transcluded components', function (done) {
    document.body.appendChild(el)
    var attachSpy = jasmine.createSpy('attached')
    var detachSpy = jasmine.createSpy('detached')
    var vm = new Vue({
      el: el,
      data: { show: true },
      template: '<outer><transcluded></transcluded></outer>',
      components: {
        outer: {
          template: '<div v-if="$parent.show"><slot></slot></div>'
        },
        transcluded: {
          template: 'transcluded',
          attached: attachSpy,
          detached: detachSpy
        }
      }
    })
    expect(attachSpy).toHaveBeenCalled()
    vm.show = false
    nextTick(function () {
      expect(detachSpy).toHaveBeenCalled()
      document.body.removeChild(el)
      done()
    })
  })

  it('call attach/detach for dynamicly created components inside if block', function (done) {
    document.body.appendChild(el)
    var attachSpy = jasmine.createSpy('attached')
    var detachSpy = jasmine.createSpy('detached')
    var transcluded = {
      props: ['a'],
      template: '{{a}}',
      attached: attachSpy,
      detached: detachSpy
    }
    var vm = new Vue({
      el: el,
      data: {
        show: true,
        list: [{a: 0}]
      },
      template:
        '<outer>' +
          '<div>' + // an extra layer to test components deep inside the tree
            '<transcluded v-for="item in list" :a="item.a"></transcluded>' +
          '</div>' +
        '</outer>',
      components: {
        outer: {
          template:
            '<div v-if="$parent.show">' +
              '<slot></slot>' +
            '</div>' +
            // this is to test that compnents that are not in the if block
            // should not fire attach/detach when v-if toggles
            '<transcluded></transcluded>',
          components: {
            transcluded: transcluded
          }
        },
        transcluded: transcluded
      }
    })
    assertMarkup()
    expect(attachSpy.calls.count()).toBe(2)
    vm.show = false
    nextTick(function () {
      assertMarkup()
      expect(detachSpy.calls.count()).toBe(1)
      vm.list.push({a: 1})
      vm.show = true
      nextTick(function () {
        assertMarkup()
        expect(attachSpy.calls.count()).toBe(2 + 2)
        vm.list.push({a: 2})
        vm.show = false
        nextTick(function () {
          assertMarkup()
          expect(attachSpy.calls.count()).toBe(2 + 2 + 1)
          expect(detachSpy.calls.count()).toBe(1 + 3)
          document.body.removeChild(el)
          done()
        })
      })
    })

    function assertMarkup () {
      var showBlock = vm.show
        ? '<div><div>' +
            vm.list.map(function (o) {
              return '<transcluded>' + o.a + '</transcluded>'
            }).join('') +
          '</div></div>'
        : ''
      var markup =
        '<outer>' +
            showBlock +
          '<transcluded></transcluded>' +
        '</outer>'
      expect(el.innerHTML).toBe(markup)
    }
  })

  it('call attach/detach for nested ifs', function (done) {
    var attachSpy = jasmine.createSpy('attached')
    var detachSpy = jasmine.createSpy('detached')
    document.body.appendChild(el)
    var vm = new Vue({
      el: el,
      data: {
        showOuter: true,
        showInner: false
      },
      template:
        '<div v-if="showOuter">' +
          '<div v-if="showInner">' +
            '<test></test>' +
          '</div>' +
        '</div>',
      components: {
        test: {
          attached: attachSpy,
          detached: detachSpy
        }
      }
    })
    expect(attachSpy).not.toHaveBeenCalled()
    vm.showInner = true
    nextTick(function () {
      expect(attachSpy.calls.count()).toBe(1)
      vm.showOuter = false
      nextTick(function () {
        expect(detachSpy.calls.count()).toBe(1)
        document.body.removeChild(el)
        done()
      })
    })
  })

  // #893 in IE textNodes do not have `contains` method
  it('call attach/detach: comparing textNodes in IE', function (done) {
    document.body.appendChild(el)
    var attachSpy = jasmine.createSpy('attached')
    var detachSpy = jasmine.createSpy('detached')
    var vm = new Vue({
      el: el,
      data: {
        show: true
      },
      template: '<template v-if="show"><test></test></template>',
      components: {
        test: {
          template: 'foo',
          replace: true,
          attached: attachSpy,
          detached: detachSpy
        }
      }
    })
    assertMarkup()
    assertCalls(1, 0)
    vm.show = false
    nextTick(function () {
      assertMarkup()
      assertCalls(1, 1)
      vm.show = true
      nextTick(function () {
        assertMarkup()
        assertCalls(2, 1)
        vm.show = false
        nextTick(function () {
          assertMarkup()
          assertCalls(2, 2)
          document.body.removeChild(el)
          done()
        })
      })
    })

    function assertMarkup () {
      expect(el.innerHTML).toBe(vm.show ? 'foo' : '')
    }

    function assertCalls (attach, detach) {
      expect(attachSpy.calls.count()).toBe(attach)
      expect(detachSpy.calls.count()).toBe(detach)
    }
  })

  // #1097 v-if components not having correct parent
  it('compile with correct transclusion host', function () {
    var parentA
    var parentB
    new Vue({
      el: el,
      data: {
        show: true
      },
      template: '<parent><child v-if="show"></child></parent>',
      components: {
        parent: {
          template: '<slot></slot>',
          created: function () {
            parentA = this
          }
        },
        child: {
          created: function () {
            parentB = this.$parent
          }
        }
      }
    })
    expect(parentA).toBeTruthy()
    expect(parentA).toBe(parentB)
  })

  it('if + else', function (done) {
    var vm = new Vue({
      el: el,
      data: { test: false, a: 'A', b: 'B' },
      template: '<div v-if="test">{{a}}</div><div v-else>{{b}}</div>'
    })
    expect(el.textContent).toBe('B')
    vm.test = true
    nextTick(function () {
      expect(el.textContent).toBe('A')
      vm.test = false
      nextTick(function () {
        expect(el.textContent).toBe('B')
        done()
      })
    })
  })

  it('else block teardown', function (done) {
    var created = jasmine.createSpy()
    var destroyed = jasmine.createSpy()
    var vm = new Vue({
      el: el,
      data: { ok: false },
      template: '<div v-if="ok"></div><div v-else><test></test></div>',
      components: {
        test: {
          created: created,
          destroyed: destroyed
        }
      }
    })
    expect(created.calls.count()).toBe(1)
    vm.$destroy()
    nextTick(function () {
      expect(destroyed.calls.count()).toBe(1)
      done()
    })
  })

  // GitHub issue #3204
  it('update array refs', function (done) {
    var vm = new Vue({
      el: el,
      template: '<foo v-if="!activeItem || $index === activeItem" v-ref:foo :index="$index" v-for="item in items"></foo>',
      data: {
        items: [0, 1, 2],
        activeItem: null
      },
      components: {
        foo: {
          props: ['index'],
          template: '<div>I am foo ({{ index }})<div>'
        }
      }
    })
    vm.$refs.foo.forEach(function (ref, index) {
      expect(ref.$el.textContent).toBe('I am foo (' + index + ')')
      expect(ref.index).toBe(index)
    })
    vm.activeItem = 1 // select active item
    nextTick(function () {
      expect(vm.$refs.foo.length).toBe(1)
      expect(vm.$refs.foo[0].index).toBe(1)
      vm.activeItem = null // enable all elements
      nextTick(function () {
        expect(vm.$refs.foo.length).toBe(3)
        done()
      })
    })
  })

  it('update object refs', function (done) {
    var vm = new Vue({
      el: el,
      template: '<foo v-if="!activeKey || $key === activeKey" v-ref:foo :key="$key" v-for="item in items"></foo>',
      data: {
        items: {
          a: 1,
          b: 2,
          c: 3
        },
        activeKey: null
      },
      components: {
        foo: {
          props: ['key'],
          template: '<div>I am foo ({{ key }})<div>'
        }
      }
    })
    Object.keys(vm.$refs.foo).forEach(function (key) {
      var ref = vm.$refs.foo[key]
      expect(ref.$el.textContent).toBe('I am foo (' + key + ')')
      expect(ref.key).toBe(key)
    })
    vm.activeKey = 'b' // select active item
    nextTick(function () {
      expect(Object.keys(vm.$refs.foo).length).toBe(1)
      expect(vm.$refs.foo['b'].key).toBe('b')
      vm.activeKey = null // enable all elements
      nextTick(function () {
        expect(Object.keys(vm.$refs.foo).length).toBe(3)
        Object.keys(vm.$refs.foo).forEach(function (key) {
          var ref = vm.$refs.foo[key]
          expect(ref.$el.textContent).toBe('I am foo (' + key + ')')
          expect(ref.key).toBe(key)
        })
        done()
      })
    })
  })
})
