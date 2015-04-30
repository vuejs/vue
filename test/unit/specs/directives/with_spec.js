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
        template: '<div v-component="test" v-with="testt:test,bb:b" v-ref="child"></div>',
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
            // test two-way
            vm.$.child.bb = 'B'
            vm.$.child.testt = { a: 'A' }
            _.nextTick(function () {
              expect(el.firstChild.textContent).toBe('A B')
              expect(vm.test.a).toBe('A')
              expect(vm.test).toBe(vm.$.child.testt)
              expect(vm.b).toBe('B')
              done()
            })
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

    it('block instance with replace:true', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test" v-with="b:a" c="{{d}}"></div>',
        data: {
          a: 'AAA',
          d: 'DDD'
        },
        components: {
          test: {
            paramAttributes: ['c'],
            template: '<p>{{b}}</p><p>{{c}}</p>',
            replace: true
          }
        }
      })
      expect(el.innerHTML).toBe('<!--v-start--><p>AAA</p><p>DDD</p><!--v-end--><!--v-component-->')
    })

    it('bind literal values should not trigger setter warning', function (done) {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test" v-with="a:\'test\'"></div>',
        components: {
          test: {
            template: '{{a}}'
          }
        }
      })
      expect(el.firstChild.innerHTML).toBe('test')
      vm._children[0].a = 'changed'
      _.nextTick(function () {
        expect(el.firstChild.innerHTML).toBe('changed')
        expect(_.warn).not.toHaveBeenCalled()
        done()
      })
    })

    it('should warn when binding literal value without childKey', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test" v-with="\'test\'"></div>',
        components: {
          test: {}
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

  })
}