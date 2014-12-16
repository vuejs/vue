var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-ref', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
    })

    var components = {
      test: {
        id: 'test'
      },
      test2: {
        id: 'test2'
      }
    }

    it('normal', function () {
      var vm = new Vue({
        el: el,
        components: components,
        template: '<div v-component="test" v-ref="test"></div>'
      })
      expect(vm.$.test).toBeTruthy()
      expect(vm.$.test.$options.id).toBe('test')
    })

    it('with dynamic v-component', function (done) {
      var vm = new Vue({
        el: el,
        components: components,
        data: { test: 'test' },
        template: '<div v-component="{{test}}" v-ref="test"></div>'
      })
      expect(vm.$.test.$options.id).toBe('test')
      vm.test = 'test2'
      _.nextTick(function () {
        expect(vm.$.test.$options.id).toBe('test2')
        vm.test = ''
        _.nextTick(function () {
          expect(vm.$.test).toBeNull()
          done()          
        })
      })
    })

    it('should also work in child template', function (done) {
      var vm = new Vue({
        el: el,
        data: { view: 'test1' },
        template: '<div v-component="{{view}}"></div>',
        components: {
          test1: {
            id: 'test1',
            template: '<div v-ref="test1"></div>',
            replace: true
          },
          test2: {
            id: 'test2',
            template: '<div v-ref="test2"></div>',
            replace: true
          }
        }
      })
      expect(vm.$.test1.$options.id).toBe('test1')
      vm.view = 'test2'
      _.nextTick(function () {
        expect(vm.$.test1).toBeNull()
        expect(vm.$.test2.$options.id).toBe('test2')
        done()
      })
    })

    it('with v-repeat', function (done) {
      var vm = new Vue({
        el: el,
        data: { items: [1,2,3,4,5] },
        template: '<div v-repeat="items" v-ref="test"></div>'
      })
      expect(vm.$.test).toBeTruthy()
      expect(Array.isArray(vm.$.test)).toBe(true)
      expect(vm.$.test[0].$value).toBe(1)
      expect(vm.$.test[4].$value).toBe(5)
      vm.items = []
      _.nextTick(function () {
        expect(vm.$.test.length).toBe(0)
        vm._directives[0].unbind()
        expect(vm.$.test).toBeNull()
        done()
      })
    })

    it('nested v-repeat', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="c1" v-ref="c1"></div>',
        components: {
          c1: {
            template: '<div v-repeat="2" v-ref="c2"></div>'
          }
        }
      })
      expect(vm.$.c1 instanceof Vue).toBe(true)
      expect(vm.$.c2).toBeUndefined()
      expect(Array.isArray(vm.$.c1.$.c2)).toBe(true)
      expect(vm.$.c1.$.c2.length).toBe(2)
    })

    it('should warn on non-root', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-ref="test"></div>'
      })
      expect(_.warn).toHaveBeenCalled()
    })

  })
}