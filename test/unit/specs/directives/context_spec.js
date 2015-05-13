var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-context', function () {

    var el
    beforeEach(function () {
      spyOn(_, 'warn')
      el = document.createElement('div')
    })

    it('inject context method', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test" v-ref="test" v-context="test:test, test2:test"></div>',
        methods: {
          test: jasmine.createSpy()
        },
        components: {
          test: {
            context: ['test', 'test2']
          }
        }
      })
      expect(vm.$.test.$context.test).toEqual(vm.test)
      expect(vm.$.test.$context.test2).toEqual(vm.test)
    })

    it('transform context', function () {
      var spy = jasmine.createSpy()
      var vm = new Vue({
        el: el,
        template: '<div v-component="test" v-ref="test" v-context="test:test"></div>',
        methods: {
          test: jasmine.createSpy()
        },
        components: {
          test: {
            context: {
              test: function (fn) {
                return spy
              }
            }
          }
        }
      })
      vm.$.test.$context.test(1, 2, 3)
      expect(vm.$.test.$context.test).toEqual(spy)
      expect(spy).toHaveBeenCalledWith(1, 2, 3)
    })

    it('warn when used on non-root node', function () {
      new Vue({
        el: el,
        template: '<div v-context="test:test"></div>'
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('warn when used on child component root', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-ref="test" v-component="test"></div>',
        methods: {
          test: jasmine.createSpy()
        },
        components: {
          test: {
            replace: true,
            template: '<div v-context="test:test"></div>'
          }
        }
      })
      expect(_.warn).toHaveBeenCalled()
      expect(vm.$.test.$context).toBe(null)
    })

    it('warn on non-function values', function () {
      var vm = new Vue({
        el: el,
        data: { test: 123 },
        template: '<div v-component="test" v-context="test:test"></div>',
        components: {
          test: {}
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('warn on no declared context', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test" v-context="test:test"></div>',
        components: {
          test: {}
        },
        methods: {
          test: jasmine.createSpy()
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('accept inline statement', function () {
      var vm = new Vue({
        el: el,
        data: {a:1},
        template: '<div v-ref="test" v-component="test" v-context="test:a++"></div>',
        components: {
          test: {
            context: ['test']
          }
        }
      })
      vm.$.test.$context.test()
      expect(vm.a).toBe(2)
    })

    it('be able to switch handlers if not a method', function (done) {
      var a = 0
      var b = 0
      var vm = new Vue({
        el: el,
        data: {
          handle: function () {
            a++
          }
        },
        template: '<div v-ref="test" v-component="test" v-context="test:handle"></div>',
        components: {
          test: {
            context: ['test']
          }
        }
      })

      vm.$.test.$context.test()
      expect(a).toBe(1)
      expect(b).toBe(0)
      vm.handle = function () {
        b++
      }
      _.nextTick(function () {
        vm.$.test.$context.test()
        expect(a).toBe(1)
        expect(b).toBe(1)
        done()
      })

    })

    it('be able to override original context', function () {
      var a = 0
      var b = 0
      var vm = new Vue({
        el: el,
        template: '<div v-ref="test" v-component="test" v-context="test:test2"></div>',
        childContext: ['test'],
        components: {
          test: {
            context: ['test']
          }
        },
        methods: {
          test: function () {
            a++
          },
          test2: function () {
            b++
          }
        }
      })

      vm.$.test.$context.test()
      expect(a).toBe(0)
      expect(b).toBe(1)
    })


  })
}