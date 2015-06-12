var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('prop', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
    })

    it('should work', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B',
          test: {
            a: 'A'
          }
        },
        template: '<test testt="{{test}}" bb="{{b}}" v-ref="child"></test>',
        components: {
          test: {
            props: ['testt', 'bb'],
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

    it('$data as prop', function (done) {
      var vm = new Vue({
        el: el,
        template: '<test $data="{{ok}}"></test>',
        data: {
          ok: {
            msg: 'hihi'
          }
        },
        components: {
          test: {
            props: ['$data'],
            template: '{{msg}}'
          }
        }
      })
      expect(el.innerHTML).toBe('<test>hihi</test>')
      vm.ok = { msg: 'what' }
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<test>what</test>')
        done()
      })
    })

    it('auto one-way binding for non-settable parent path', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B'
        },
        template: '<test b="{{b + \'B\'}}" v-ref="child"></test>',
        components: {
          test: {
            props: ['b'],
            template: '{{b}}'
          }
        }
      })
      expect(el.innerHTML).toBe('<test>BB</test>')
      vm.b = 'BB'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<test>BBB</test>')
        vm.$.child.b = 'hahaha'
        _.nextTick(function () {
          expect(vm.b).toBe('BB')
          expect(el.innerHTML).toBe('<test>hahaha</test>')
          done()
        })
      })
    })

    it('explicit one time binding', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B'
        },
        template: '<test b="{{*b}}" v-ref="child"></test>',
        components: {
          test: {
            props: ['b'],
            template: '{{b}}'
          }
        }
      })
      expect(el.innerHTML).toBe('<test>B</test>')
      vm.b = 'BB'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<test>B</test>')
        done()
      })
    })

    it('one way down binding', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B'
        },
        template: '<test b="{{<b}}" v-ref="child"></test>',
        components: {
          test: {
            props: ['b'],
            template: '{{b}}'
          }
        }
      })
      expect(el.innerHTML).toBe('<test>B</test>')
      vm.b = 'BB'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<test>BB</test>')
        vm.$.child.b = 'BBB'
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<test>BBB</test>')
          expect(vm.b).toBe('BB')
          done()
        })
      })
    })

    it('one way up binding', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: null
        },
        template: '<test b="{{>b}}" v-ref="child"></test>',
        components: {
          test: {
            props: ['b'],
            template: '{{b}}',
            data: function () {
              return {
                b: 'B'
              }
            }
          }
        }
      })
      expect(el.innerHTML).toBe('<test>B</test>')
      // initial set
      expect(vm.b).toBe('B')
      vm.b = 'BB'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<test>B</test>')
        vm.$.child.b = 'BBB'
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<test>BBB</test>')
          expect(vm.b).toBe('BBB')
          done()
        })
      })
    })

    it('warn invalid keys', function () {
      var vm = new Vue({
        el: el,
        template: '<test a.b.c="{{test}}"></test>',
        components: {
          test: {
            props: ['a.b.c']
          }
        }
      })
      expect(hasWarned(_, 'Invalid prop key')).toBe(true)
    })

    it('teardown', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B'
        },
        template: '<test bb="{{b}}"></test>',
        components: {
          test: {
            props: ['bb'],
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

    it('block instance with replace:true', function () {
      var vm = new Vue({
        el: el,
        template: '<test b="{{a}}" c="{{d}}"></test>',
        data: {
          a: 'AAA',
          d: 'DDD'
        },
        components: {
          test: {
            props: ['b', 'c'],
            template: '<p>{{b}}</p><p>{{c}}</p>',
            replace: true
          }
        }
      })
      expect(el.innerHTML).toBe('<p>AAA</p><p>DDD</p>')
    })

  })
}
