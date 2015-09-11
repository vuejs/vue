var _ = require('../../../../../src/util')
var Vue = require('../../../../../src/vue')

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
        template: '<div v-if="ok" $$.test-el id="test"></div>'
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

    it('inside v-for', function () {
      var vm = new Vue({
        el: el,
        data: { items: [1, 2] },
        template: '<div v-for="n in items"><p $$.test>{{n}}</p>{{$$.test.textContent}}</div>'
      })
      expect(vm.$el.textContent).toBe('1122')
    })

  })
}
