var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-component', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
    })

    it('static', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test"></div>',
        components: {
          test: {
            data: function () {
              return { a: 123 }
            },
            template: '{{a}}'
          }
        }
      })
      expect(el.innerHTML).toBe('<div>123</div><!--v-component-->')
    })

    it('replace', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test"></div>',
        components: {
          test: {
            replace: true,
            data: function () {
              return { a: 123 }
            },
            template: '<p>{{a}}</p>'
          }
        }
      })
      expect(el.innerHTML).toBe('<p>123</p><!--v-component-->')
    })

    it('block replace', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test"></div>',
        components: {
          test: {
            replace: true,
            data: function () {
              return { a: 123, b: 234 }
            },
            template: '<p>{{a}}</p><p>{{b}}</p>'
          }
        }
      })
      expect(el.innerHTML).toBe('<p>123</p><p>234</p><!--v-component-->')
    })

    it('dynamic', function (done) {
      var vm = new Vue({
        el: el,
        template: '<div v-component="{{view}}" v-attr="view:view"></div>',
        data: {
          view: 'a'
        },
        components: {
          a: {
            template: 'AAA',
            data: function () {
              return { view: 'a' }
            }
          },
          b: {
            template: 'BBB',
            data: function () {
              return { view: 'b' }
            }
          }
        }
      })
      expect(el.innerHTML).toBe('<div view="a">AAA</div><!--v-component-->')
      vm.view = 'b'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div view="b">BBB</div><!--v-component-->')
        done()
      })
    })

    it('static v-if', function (done) {
      var vm = new Vue({
        el: el,
        data: { ok: false },
        template: '<div v-component="test" v-if="ok"></div>',
        components: {
          test: {
            data: function () {
              return { a: 123 }
            },
            template: '{{a}}'
          }
        }
      })
      expect(el.innerHTML).toBe('<!--v-component-->')
      expect(vm._children).toBeNull()
      vm.ok = true
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div>123</div><!--v-component-->')
        expect(vm._children.length).toBe(1)
        vm.ok = false
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<!--v-component-->')
          expect(vm._children.length).toBe(0)
          done()
        })
      })
    })

    it('dynamic v-if', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          ok: false,
          view: 'a'
        },
        template: '<div v-component="{{view}}" v-if="ok"></div>',
        components: {
          a: {
            template: 'AAA'
          },
          b: {
            template: 'BBB'
          }
        }
      })
      expect(el.innerHTML).toBe('<!--v-component-->')
      expect(vm._children).toBeNull()
      // toggle if with lazy instantiation
      vm.ok = true
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div>AAA</div><!--v-component-->')
        expect(vm._children.length).toBe(1)
        // switch view when if=true
        vm.view = 'b'
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<div>BBB</div><!--v-component-->')
          expect(vm._children.length).toBe(1)
          // toggle if when already instantiated
          vm.ok = false
          _.nextTick(function () {
            expect(el.innerHTML).toBe('<!--v-component-->')
            expect(vm._children.length).toBe(0)
            // toggle if and switch view at the same time
            vm.view = 'a'
            vm.ok = true
            _.nextTick(function () {
              expect(el.innerHTML).toBe('<div>AAA</div><!--v-component-->')
              expect(vm._children.length).toBe(1)
              done()
            })
          })
        })
      })
    })

    it('keep-alive', function (done) {
      var spyA = jasmine.createSpy()
      var spyB = jasmine.createSpy()
      var vm = new Vue({
        el: el,
        template: '<div v-component="{{view}}" keep-alive></div>',
        data: {
          view: 'a'
        },
        components: {
          a: {
            created: spyA,
            template: 'AAA'
          },
          b: {
            created: spyB,
            template: 'BBB'
          }
        }
      })
      expect(el.innerHTML).toBe('<div>AAA</div><!--v-component-->')
      expect(spyA.calls.count()).toBe(1)
      expect(spyB.calls.count()).toBe(0)
      vm.view = 'b'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div>BBB</div><!--v-component-->')
        expect(spyA.calls.count()).toBe(1)
        expect(spyB.calls.count()).toBe(1)
        vm.view = 'a'
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<div>AAA</div><!--v-component-->')
          expect(spyA.calls.count()).toBe(1)
          expect(spyB.calls.count()).toBe(1)
          vm.view = 'b'
          _.nextTick(function () {
            expect(el.innerHTML).toBe('<div>BBB</div><!--v-component-->')
            expect(spyA.calls.count()).toBe(1)
            expect(spyB.calls.count()).toBe(1)
            done()
          })
        })
      })
    })

    it('teardown', function () {
      var vm = new Vue({
        el: el,
        data: { ok: true },
        template: '<div v-component="test" v-if="ok"></div>',
        components: {
          test: {}
        }
      })
      var child = vm._children[0]
      vm._directives[0].unbind()
      expect(vm._children.length).toBe(0)
      expect(child._isDestroyed).toBe(true)
    })

    it('already mounted warn', function () {
      el.setAttribute('v-component', 'test')
      var vm = new Vue({
        el: el
      })
      expect(_.warn).toHaveBeenCalled()
    })

  })
}