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

    it('should inject context method', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test" v-ref="test" v-context="test:test, test2:test"></div>',
        methods: {
          test: jasmine.createSpy()
        },
        components: {
          test: {}
        }
      })
      expect(vm.$.test.$context.test).toEqual(vm.test)
      expect(vm.$.test.$context.test2).toEqual(vm.test)
    })

    it('should warn when used on non-root node', function () {
      new Vue({
        el: el,
        template: '<div v-context="test:test"></div>'
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('should warn when used on child component root', function () {
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

    it('should warn on non-function values', function () {
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

    it('should accept inline statement', function () {
      var vm = new Vue({
        el: el,
        data: {a:1},
        template: '<div v-ref="test" v-component="test" v-context="test:a++"></div>',
        components: {
          test: {}
        }
      })
      vm.$.test.$context.test()
      expect(vm.a).toBe(2)
    })

    it('should be able to switch handlers if not a method', function (done) {
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
          test: {}
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

    it('should be able to override original context', function () {
      var a = 0
      var b = 0
      var c = 0
      var d = 0
      var vm = new Vue({
        el: el,
        template: '<div v-ref="test" v-component="test" v-context="test:test,test2:test3"></div>',
        childContext: ['test2'],
        components: {
          test: {
            context: ['test2'],
            methods: {
              test: function () {
                b++
              }
            }
          }
        },
        methods: {
          test: function () {
            a++
          },
          test2: function () {
            c++
          },
          test3: function () {
            d++
          }
        }
      })

      vm.$.test.$context.test()
      vm.$.test.$context.test2()
      expect(a).toBe(1)
      expect(b).toBe(0)
      expect(c).toBe(0)
      expect(d).toBe(1)
    })
  })
}