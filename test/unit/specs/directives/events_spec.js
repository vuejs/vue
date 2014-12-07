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

    it('should warn when method not found on parent', function () {
      new Vue({
        el: el,
        template: '<div v-component="test" v-events="test:test"></div>',
        components: {
          test: {}
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

  })
}