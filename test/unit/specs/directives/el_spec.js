var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('el', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
      spyOn(_, 'log')
    })

    it('normal', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          ok: true
        },
        template: '<div v-if="ok" el="test" id="test"></div>'
      })
      expect(vm.$$.test).toBeTruthy()
      expect(vm.$$.test.id).toBe('test')
      vm.ok = false
      _.nextTick(function () {
        expect(vm.$$.test).toBeNull()
        vm.ok = true
        _.nextTick(function () {
          expect(vm.$$.test.id).toBe('test')
          done()
        })
      })
    })

    it('bind-el', function () {
      var vm = new Vue({
        el: el,
        data: {
          id: 'test'
        },
        template: '<div bind-el="id" id="test"></div>'
      })
      expect(vm.$$.test).toBeTruthy()
      expect(vm.$$.test.id).toBe('test')
      expect(_.log).toHaveBeenCalled()
    })

    it('inside v-for', function () {
      var vm = new Vue({
        el: el,
        data: { items: [1, 2] },
        template: '<div v-for="n in items"><p el="test">{{n}}</p>{{$$.test.textContent}}</div>'
      })
      expect(vm.$el.textContent).toBe('1122')
    })

  })
}
