var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('ref', function () {

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
        data: {
          ref: 'test2'
        },
        template: '<test ref="test"></test><test2 bind-ref="ref"></test2>'
      })
      expect(vm.$.test).toBeTruthy()
      expect(vm.$.test.$options.id).toBe('test')
      expect(vm.$.test2).toBeTruthy()
      expect(vm.$.test2.$options.id).toBe('test2')
    })

    it('with dynamic v-component', function (done) {
      var vm = new Vue({
        el: el,
        components: components,
        data: { test: 'test' },
        template: '<component bind-is="test" ref="test"></component>'
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

    it('should be reactive when bound by dynamic component and hoisted', function (done) {
      var vm = new Vue({
        el: el,
        data: { view: 'one' },
        template: '{{$.test.value}}<component bind-is="view" ref="test"></component>',
        components: {
          one: {
            id: 'one',
            replace: true,
            data: function () {
              return { value: 1 }
            }
          },
          two: {
            id: 'two',
            replace: true,
            data: function () {
              return { value: 2 }
            }
          }
        }
      })
      expect(vm.$.test.$options.id).toBe('one')
      expect(el.textContent).toBe('1')
      vm.view = 'two'
      _.nextTick(function () {
        expect(vm.$.test.$options.id).toBe('two')
        expect(el.textContent).toBe('2')
        vm.view = ''
        _.nextTick(function () {
          expect(vm.$.test).toBeNull()
          expect(el.textContent).toBe('')
          done()
        })
      })
    })

    // #1147
    it('should be able to reference host via ref inside transclusion content', function (done) {
      var vm = new Vue({
        el: el,
        template:
          '<div>' +
            '<comp ref="out">{{$.out.msg}}</comp>' +
          '</div>',
        components: {
          comp: {
            template: '<slot></slot>',
            data: function () {
              return { msg: 'hi' }
            }
          }
        }
      })
      expect(_.warn).not.toHaveBeenCalled()
      expect(vm.$el.textContent).toBe('hi')
      vm.$children[0].msg = 'ho'
      _.nextTick(function () {
        expect(vm.$el.textContent).toBe('ho')
        done()
      })
    })
  })
}
