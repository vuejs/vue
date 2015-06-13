var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('prop', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
    })

    it('one way binding', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B'
        },
        template: '<test b="{{b}}" v-ref="child"></test>',
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

    it('two-way binding', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B',
          test: {
            a: 'A'
          }
        },
        template: '<test testt="{{@test}}" bb="{{@b}}" v-ref="child"></test>',
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

    it('non-settable parent path', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          b: 'B'
        },
        template: '<test b="{{@ b + \'B\' }}" v-ref="child"></test>',
        components: {
          test: {
            props: ['b'],
            template: '{{b}}'
          }
        }
      })
      expect(hasWarned(_, 'Cannot bind two-way prop with non-settable parent path')).toBe(true)
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
          a: 'A',
          b: 'B'
        },
        template: '<test aa="{{@a}}" bb="{{b}}"></test>',
        components: {
          test: {
            props: ['aa', 'bb'],
            template: '{{aa}} {{bb}}'
          }
        }
      })
      var child = vm._children[0]
      expect(el.firstChild.textContent).toBe('A B')
      child.aa = 'AA'
      vm.b = 'BB'
      _.nextTick(function () {
        expect(el.firstChild.textContent).toBe('AA BB')
        expect(vm.a).toBe('AA')
        // unbind the two props
        child._directives[0].unbind()
        child._directives[1].unbind()
        child.aa = 'AAA'
        vm.b = 'BBB'
        _.nextTick(function () {
          expect(el.firstChild.textContent).toBe('AAA BB')
          expect(vm.a).toBe('AA')
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

    describe('assertions', function () {

      function makeInstance (value, type, validator) {
        return new Vue({
          el: document.createElement('div'),
          template: '<test prop="{{val}}"></test>',
          data: {
            val: value
          },
          components: {
            test: {
              props: [
                {
                  name: 'prop',
                  type: type,
                  validator: validator
                }
              ]
            }
          }
        })
      }

      it('string', function () {
        makeInstance('hello', String)
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance(123, String)
        expect(hasWarned(_, 'Expected String')).toBe(true)
      })

      it('number', function () {
        makeInstance(123, Number)
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance('123', Number)
        expect(hasWarned(_, 'Expected Number')).toBe(true)
      })

      it('boolean', function () {
        makeInstance(true, Boolean)
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance('123', Boolean)
        expect(hasWarned(_, 'Expected Boolean')).toBe(true)
      })

      it('function', function () {
        makeInstance(function () {}, Function)
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance(123, Function)
        expect(hasWarned(_, 'Expected Function')).toBe(true)
      })

      it('object', function () {
        makeInstance({}, Object)
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance([], Object)
        expect(hasWarned(_, 'Expected Object')).toBe(true)
      })

      it('array', function () {
        makeInstance([], Array)
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance({}, Array)
        expect(hasWarned(_, 'Expected Array')).toBe(true)
      })

      it('custom constructor', function () {
        function Class () {}
        makeInstance(new Class(), Class)
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance({}, Class)
        expect(hasWarned(_, 'Expected custom type')).toBe(true)
      })

      it('custom validator', function () {
        makeInstance(123, null, function (v) {
          return v === 123
        })
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance(123, null, function (v) {
          return v === 234
        })
        expect(hasWarned(_, 'custom validator check failed')).toBe(true)
      })

      it('type check + custom validator', function () {
        makeInstance(123, Number, function (v) {
          return v === 123
        })
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance(123, Number, function (v) {
          return v === 234
        })
        expect(hasWarned(_, 'custom validator check failed')).toBe(true)
        makeInstance(123, String, function (v) {
          return v === 123
        })
        expect(hasWarned(_, 'Expected String')).toBe(true)
      })

      it('required', function () {
        var vm = new Vue({
          el: document.createElement('div'),
          template: '<test></test>',
          components: {
            test: {
              props: [
                {
                  name: 'prop',
                  required: true
                }
              ]
            }
          }
        })
        expect(hasWarned(_, 'Missing required prop')).toBe(true)
      })

    })
  })
}
