var _ = require('../../../../../src/util')
var Vue = require('../../../../../src/vue')

if (_.inBrowser) {
  describe('v-if', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
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
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div><test>A</test></div>')
        expect(vm.$children.length).toBe(1)
        vm.test = false
        _.nextTick(function () {
          expect(el.innerHTML).toBe('')
          expect(vm.$children.length).toBe(0)
          vm.test = true
          _.nextTick(function () {
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
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<p>A</p><p>B</p>')
        vm.test = false
        _.nextTick(function () {
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
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<test>123</test>')
        expect(vm.$children.length).toBe(1)
        expect(attachSpy).toHaveBeenCalled()
        expect(readySpy).toHaveBeenCalled()
        vm.ok = false
        _.nextTick(function () {
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
            template: 'AAA'
          },
          'view-b': {
            template: 'BBB'
          }
        }
      })
      expect(el.innerHTML).toBe('')
      expect(vm.$children.length).toBe(0)
      // toggle if with lazy instantiation
      vm.ok = true
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<component>AAA</component>')
        expect(vm.$children.length).toBe(1)
        // switch view when if=true
        vm.view = 'view-b'
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<component>BBB</component>')
          expect(vm.$children.length).toBe(1)
          // toggle if when already instantiated
          vm.ok = false
          _.nextTick(function () {
            expect(el.innerHTML).toBe('')
            expect(vm.$children.length).toBe(0)
            // toggle if and switch view at the same time
            vm.view = 'view-a'
            vm.ok = true
            _.nextTick(function () {
              expect(el.innerHTML).toBe('<component>AAA</component>')
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
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div>2</div>')
        done()
      })
    })

    it('invalid warn', function () {
      el.setAttribute('v-if', 'test')
      new Vue({
        el: el
      })
      expect(hasWarned(_, 'cannot be used on an instance root element')).toBe(true)
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
      _.nextTick(function () {
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
      _.nextTick(function () {
        assertMarkup()
        expect(detachSpy.calls.count()).toBe(1)
        vm.list.push({a: 1})
        vm.show = true
        _.nextTick(function () {
          assertMarkup()
          expect(attachSpy.calls.count()).toBe(2 + 2)
          vm.list.push({a: 2})
          vm.show = false
          _.nextTick(function () {
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
      _.nextTick(function () {
        expect(attachSpy.calls.count()).toBe(1)
        vm.showOuter = false
        _.nextTick(function () {
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
            template: 'hi',
            replace: true,
            attached: attachSpy,
            detached: detachSpy
          }
        }
      })
      assertMarkup()
      assertCalls(1, 0)
      vm.show = false
      _.nextTick(function () {
        assertMarkup()
        assertCalls(1, 1)
        vm.show = true
        _.nextTick(function () {
          assertMarkup()
          assertCalls(2, 1)
          vm.show = false
          _.nextTick(function () {
            assertMarkup()
            assertCalls(2, 2)
            document.body.removeChild(el)
            done()
          })
        })
      })

      function assertMarkup () {
        expect(el.innerHTML).toBe(vm.show ? 'hi' : '')
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
      _.nextTick(function () {
        expect(el.textContent).toBe('A')
        vm.test = false
        _.nextTick(function () {
          expect(el.textContent).toBe('B')
          done()
        })
      })
    })

  })
}
