var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-if', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
    })

    it('normal', function (done) {
      var vm = new Vue({
        el: el,
        data: { test: false, a: 'A' },
        template: '<div v-if="test">{{a}}</div>'
      })
      // lazy instantitation
      expect(el.innerHTML).toBe('<!--v-if-->')
      expect(vm._children).toBeNull()
      vm.test = true
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div>A</div><!--v-if-->')
        expect(vm._children.length).toBe(1)
        vm.test = false
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<!--v-if-->')
          expect(vm._children.length).toBe(1)
          var child = vm._children[0]
          vm.test = true
          _.nextTick(function () {
            expect(el.innerHTML).toBe('<div>A</div><!--v-if-->')
            expect(vm._children.length).toBe(1)
            vm.$destroy()
            expect(child._isDestroyed).toBe(true)
            done()
          })
        })
      })
    })

    it('template block', function (done) {
      var vm = new Vue({
        el: el,
        data: { test: false, a: 'A', b: 'B' },
        template: '<template v-if="test"><p>{{a}}</p><p>{{b}}</p></template>'
      })
      // lazy instantitation
      expect(el.innerHTML).toBe('<!--v-if-->')
      expect(vm._children).toBeNull()
      vm.test = true
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<p>A</p><p>B</p><!--v-if-->')
        expect(vm._children.length).toBe(1)
        vm.test = false
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<!--v-if-->')
          expect(vm._children.length).toBe(1)
          done()
        })
      })
    })

    it('invalid warn', function () {
      el.setAttribute('v-if', 'test')
      var vm = new Vue({
        el: el
      })
      expect(_.warn).toHaveBeenCalled()
    })

  })
}