var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-el', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
      spyOn(_, 'log')
    })

    it('normal', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-el="test" id="test"></div>'
      })
      expect(vm.$$.test).toBeTruthy()
      expect(vm.$$.test.id).toBe('test')
      vm._directives[0]._teardown()
      expect(vm.$$.test).toBeNull()
    })

    it('dynamic', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          id: 'test'
        },
        template: '<div v-el="{{id}}" id="test"></div>'
      })
      expect(vm.$$.test).toBeTruthy()
      expect(vm.$$.test.id).toBe('test')
      vm.id = 'changed'
      _.nextTick(function () {
        expect(vm.$$.test).toBeNull()
        expect(vm.$$.changed).toBeTruthy()
        expect(vm.$$.changed.id).toBe('test')
        done()
      })
    })

    it('normal (new syntax)', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          ok: true
        },
        template: '<div $$.test-el v-if="ok" id="test"></div>'
      })
      expect(vm.$$.testEl).toBeTruthy()
      expect(vm.$$.testEl.id).toBe('test')
      vm.ok = false
      _.nextTick(function () {
        expect(vm.$$.testEl).toBeNull()
        vm.ok = true
        _.nextTick(function () {
          expect(vm.$$.testEl.id).toBe('test')
          done()
        })
      })
    })

    it('with v-repeat', function (done) {
      var vm = new Vue({
        el: el,
        data: { items: [1, 2, 3, 4, 5] },
        template: '<div v-repeat="items" v-el="test">{{$value}}</div>'
      })
      expect(vm.$$.test).toBeTruthy()
      expect(Array.isArray(vm.$$.test)).toBe(true)
      expect(vm.$$.test[0].textContent).toBe('1')
      expect(vm.$$.test[4].textContent).toBe('5')
      vm.items = []
      _.nextTick(function () {
        expect(vm.$$.test.length).toBe(0)
        done()
      })
    })

  })
}
