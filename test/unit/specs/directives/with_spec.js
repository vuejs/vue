var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-with', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
    })

    it('no arg', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: {
            a: 'A'
          }
        },
        template: '<div v-component="test" v-with="test"></div>',
        components: {
          test: {
            template: '{{a}}'
          }
        }
      })
      expect(el.firstChild.textContent).toBe('A')
      // swap nested prop
      vm.test.a = 'B'
      _.nextTick(function () {
        expect(el.firstChild.textContent).toBe('B')
        // swap passed down prop
        vm.test = { a: 'C' }
        _.nextTick(function () {
          expect(el.firstChild.textContent).toBe('C')
          // swap root $data
          vm.$data = { test: { a: 'D' }}
          _.nextTick(function () {
            expect(el.firstChild.textContent).toBe('D')
            done()
          })
        })
      })
    })

    it('with arg', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B',
          test: {
            a: 'A'
          }
        },
        template: '<div v-component="test" v-with="testt:test,bb:b"></div>',
        components: {
          test: {
            template: '{{testt.a}} {{bb}}'
          }
        }
      })
      expect(el.firstChild.textContent).toBe('A B')
      vm.test.a = 'AA'
      vm.b = 'BB'
      _.nextTick(function () {
        expect(el.firstChild.textContent).toBe('AA BB')
        vm.test = { a: 'AAA' }
        _.nextTick(function () {
          expect(el.firstChild.textContent).toBe('AAA BB')
          vm.$data = {
            b: 'BBB',
            test: {
              a: 'AAAA'
            }
          }
          _.nextTick(function () {
            expect(el.firstChild.textContent).toBe('AAAA BBB')
            done()
          })
        })
      })
    })

    it('teardown', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B'
        },
        template: '<div v-component="test" v-with="bb:b"></div>',
        components: {
          test: {
            template: '{{bb}}'
          }
        }
      })
      expect(el.firstChild.textContent).toBe('B')
      vm.b = 'BB'
      _.nextTick(function () {
        expect(el.firstChild.textContent).toBe('BB')
        vm._children[0]._directives[0].unbind()
        vm.b = 'BBB'
        _.nextTick(function () {
          expect(el.firstChild.textContent).toBe('BB')
          done()
        })
      })
    })

    it('non-root warning', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-with="test"></div>'
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('no-parent warning', function () {
      el.setAttribute('v-with', 'test')
      var vm = new Vue({
        el: el
      })
      expect(_.warn).toHaveBeenCalled()
    })

  })
}