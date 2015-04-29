var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-events', function () {

    var el
    beforeEach(function () {
      spyOn(_, 'warn')
      el = document.createElement('div')
    })

    it('should register events', function () {
      var spy = jasmine.createSpy('v-events')
      new Vue({
        el: el,
        template: '<div v-component="test" v-events="test:test"></div>',
        methods: {
          test: spy
        },
        components: {
          test: {
            compiled: function () {
              this.$emit('test')
            }
          }
        }
      })
      expect(spy).toHaveBeenCalled()
    })

    it('should warn when used on non-root node', function () {
      new Vue({
        el: el,
        template: '<div v-events="test:test"></div>'
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('should warn when used on child component root', function () {
      var spy = jasmine.createSpy('v-events')
      new Vue({
        el: el,
        template: '<div v-component="test"></div>',
        methods: {
          test: spy
        },
        components: {
          test: {
            replace: true,
            template: '<div v-events="test:test"></div>',
            compiled: function () {
              this.$emit('test')
            }
          }
        }
      })
      expect(_.warn).toHaveBeenCalled()
      expect(spy).not.toHaveBeenCalled()
    })

    it('should warn on non-function values', function () {
      var vm = new Vue({
        el: el,
        data: { test: 123 },
        template: '<div v-component="test" v-events="test:test"></div>',
        components: {
          test: {}
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('should accept inline statement', function (done) {
      var vm = new Vue({
        el: el,
        data: {a:1},
        template: '<div v-component="test" v-events="test:a++"></div>',
        components: {
          test: {
            compiled: function () {
              this.$emit('test')
            }
          }
        }
      })
      _.nextTick(function () {
        expect(vm.a).toBe(2)
        done()
      })
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
        template: '<div v-component="test" v-events="test:handle"></div>',
        components: {
          test: {
            compiled: function () {
              this.$emit('test')
            }
          }
        }
      })
      _.nextTick(function () {
        expect(a).toBe(1)
        expect(b).toBe(0)
        vm.handle = function () {
          b++
        }
        _.nextTick(function () {
          vm._children[0].$emit('test')
          expect(a).toBe(1)
          expect(b).toBe(1)
          done()
        })
      })
    })

  })
}