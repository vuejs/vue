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
        expect(vm.b).toBe('BB')
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<test>BBB</test>')
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
        template: '<test testt="{{@test}}" bb="{{@b}}" a="{{@ test.a }}" v-ref="child"></test>',
        components: {
          test: {
            props: ['testt', 'bb', 'a'],
            template: '{{testt.a}} {{bb}} {{a}}'
          }
        }
      })
      expect(el.firstChild.textContent).toBe('A B A')
      vm.test.a = 'AA'
      vm.b = 'BB'
      _.nextTick(function () {
        expect(el.firstChild.textContent).toBe('AA BB AA')
        vm.test = { a: 'AAA' }
        _.nextTick(function () {
          expect(el.firstChild.textContent).toBe('AAA BB AAA')
          vm.$data = {
            b: 'BBB',
            test: {
              a: 'AAAA'
            }
          }
          _.nextTick(function () {
            expect(el.firstChild.textContent).toBe('AAAA BBB AAAA')
            // test two-way
            vm.$.child.bb = 'B'
            vm.$.child.testt = { a: 'A' }
            _.nextTick(function () {
              expect(el.firstChild.textContent).toBe('A B A')
              expect(vm.test.a).toBe('A')
              expect(vm.test).toBe(vm.$.child.testt)
              expect(vm.b).toBe('B')
              vm.$.child.a = 'Oops'
              _.nextTick(function () {
                expect(el.firstChild.textContent).toBe('Oops B Oops')
                expect(vm.test.a).toBe('Oops')
                done()
              })
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
      new Vue({
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

    it('warn props with no el option', function () {
      new Vue({
        props: ['a']
      })
      expect(hasWarned(_, 'Props will not be compiled if no `el`')).toBe(true)
    })

    it('warn object/array default values', function () {
      new Vue({
        el: el,
        props: {
          arr: {
            type: Array,
            default: []
          },
          obj: {
            type: Object,
            default: {}
          }
        }
      })
      expect(hasWarned(_, 'Use a factory function to return the default value')).toBe(true)
      expect(_.warn.calls.count()).toBe(2)
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
      var child = vm.$children[0]
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
      new Vue({
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

      it('number or boolean', function () {
        makeInstance(123, [Number, Boolean])
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance(true, [Number, Boolean])
        expect(_.warn).not.toHaveBeenCalled()
        makeInstance('123', [Number, Boolean])
        expect(hasWarned(_, 'Expected one of Number, Boolean')).toBe(true)
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
        new Vue({
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

    it('alternative syntax', function () {
      new Vue({
        el: el,
        template: '<test b="{{a}}" c="{{d}}"></test>',
        data: {
          a: 'AAA',
          d: 'DDD'
        },
        components: {
          test: {
            props: {
              b: String,
              c: {
                type: Number
              },
              d: {
                required: true
              }
            },
            template: '<p>{{b}}</p><p>{{c}}</p>'
          }
        }
      })
      expect(hasWarned(_, 'Missing required prop')).toBe(true)
      expect(hasWarned(_, 'Expected Number')).toBe(true)
      expect(el.textContent).toBe('AAA')
    })

    it('should not overwrite inherit:true properties', function () {
      var vm = new Vue({
        el: el,
        data: {
          msg: 'hi!'
        },
        template: '<test msg="ho!"></test>',
        components: {
          test: {
            props: ['msg'],
            inherit: true,
            template: '{{msg}}'
          }
        }
      })
      expect(vm.msg).toBe('hi!')
      expect(el.textContent).toBe('ho!')
    })

    describe('mixed type literal prop casting', function () {

      function makeInstance (value, type) {
        return new Vue({
          el: el,
          template: '<test prop="' + value + '"></test>',
          components: {
            test: {
              props: {
                prop: type
              }
            }
          }
        })
      }

      it('number as string', function () {
        var vm = makeInstance('123', String)
        expect(vm.$children[0].prop).toBe('123')
      })

      it('boolean as string', function () {
        var vm = makeInstance('true', String)
        expect(vm.$children[0].prop).toBe('true')
      })

      it('boolean and string with boolean value', function () {
        var vm = makeInstance('true', [String, Boolean])
        expect(vm.$children[0].prop).toBe(true)
      })

      it('boolean and string with number value', function () {
        var vm = makeInstance('123', [String, Boolean])
        expect(vm.$children[0].prop).toBe('123')
      })

      it('number and string with number value', function () {
        var vm = makeInstance('123', [String, Number])
        expect(vm.$children[0].prop).toBe(123)
      })

      it('number and string with boolean value', function () {
        var vm = makeInstance('true', [String, Number])
        expect(vm.$children[0].prop).toBe('true')
      })

      it('number and boolean with number value', function () {
        var vm = makeInstance('123', [Number, Boolean])
        expect(vm.$children[0].prop).toBe(123)
      })

      it('number and boolean with boolean value', function () {
        var vm = makeInstance('true', [Number, Boolean])
        expect(vm.$children[0].prop).toBe(true)
      })

      it('number, boolean and string with boolean value', function () {
        var vm = makeInstance('true', [Number, String, Boolean])
        expect(vm.$children[0].prop).toBe(true)
      })

      it('number, boolean and string with number value', function () {
        var vm = makeInstance('123', [Number, String, Boolean])
        expect(vm.$children[0].prop).toBe(123)
      })

      it('number, boolean and string with string value', function () {
        var vm = makeInstance('hello', [Number, String, Boolean])
        expect(vm.$children[0].prop).toBe('hello')
      })

      it('number, boolean and string with empty value', function () {
        var vm = makeInstance('', [Number, String, Boolean])
        expect(vm.$children[0].prop).toBe(true)
      })

      it('number and boolean with empty value', function () {
        var vm = makeInstance('', [Number, Boolean])
        expect(vm.$children[0].prop).toBe(true)
      })

      it('number and string with empty value', function () {
        var vm = makeInstance('', [Number, String])
        expect(vm.$children[0].prop).toBe('')
      })

      it('string with empty value', function () {
        var vm = makeInstance('', [String])
        expect(vm.$children[0].prop).toBe('')
      })

      it('null type with empty value', function () {
        var vm = makeInstance('', [])
        expect(vm.$children[0].prop).toBe('')
      })

      it('null type with number value', function () {
        var vm = makeInstance('123', [])
        expect(vm.$children[0].prop).toBe(123)
      })

      it('null type with boolean value', function () {
        var vm = makeInstance('true', [])
        expect(vm.$children[0].prop).toBe(true)
      })

      it('null type with string value', function () {
        var vm = makeInstance('hello', [])
        expect(vm.$children[0].prop).toBe('hello')
      })

    })

    describe('defaults', function () {

      function makeInstance (prop, data) {
        var test = {
          props: {
            prop: prop
          },
          template: '{{prop}}'
        }

        if (data) {
          test.data = data
        }

        return new Vue({
          el: el,
          template: '<test></test>',
          components: {
            test: test
          }
        })
      }

      it('should not overwrite default value for an absent Boolean prop', function () {
        var vm = makeInstance(Boolean, function () {
          return {
            prop: true
          }
        })

        expect(vm.$children[0].prop).toBe(true)
        expect(vm.$el.textContent).toBe('true')
        expect(JSON.stringify(vm.$children[0].$data)).toBe(JSON.stringify({
          prop: true
        }))
      })

      it('should respect default value of a Boolean prop', function () {
        var vm = makeInstance({
          type: Boolean,
          default: true
        })

        expect(vm.$el.textContent).toBe('true')
      })

      it('should use false as default value of a Boolean prop if not specified', function () {
        var vm = makeInstance({
          type: [Boolean]
        })

        expect(vm.$children[0].prop).toBe(false)
        expect(vm.$el.textContent).toBe('false')
      })

      it('should use undefined as default value of a mixed type prop if not specified', function () {
        var vm = makeInstance({
          type: [Boolean, Number]
        })

        expect(vm.$children[0].prop).toBe(undefined)
        expect(vm.$el.textContent).toBe('')
      })

      it('should call default function if type is not Function', function () {
        var called = false
        var def = function () {
          called = true
          return true
        }

        var vm = makeInstance({
          type: Boolean,
          default: def
        })

        expect(vm.$children[0].prop).toBe(true)
        expect(vm.$el.textContent).toBe('true')
        expect(called).toBe(true)
      })

      it('should not call default function if type is Function', function () {
        var called = false
        function f () {
          called = true
          return 'hello'
        }

        var vm = makeInstance({
          type: Function,
          default: f
        })

        expect(called).toBe(false)
        expect(vm.$children[0].prop()).toBe('hello')
        expect(called).toBe(true)
      })

      it('should call default function if type is mixed and includes Function', function () {
        var called = false
        function f () {
          called = true
          return 'hello'
        }

        var vm = makeInstance({
          type: [Function, String],
          default: function () {
            return f
          }
        })

        expect(called).toBe(false)
        expect(vm.$children[0].prop()).toBe('hello')
        expect(called).toBe(true)
      })

      it('should initialize with default value when not provided & has default data', function (done) {
        var vm = new Vue({
          el: el,
          template: '<test></test>',
          components: {
            test: {
              props: {
                prop: {
                  type: String,
                  default: 'hello'
                }
              },
              data: function () {
                return {
                  other: 'world'
                }
              },
              template: '{{prop}} {{other}}'
            }
          }
        })
        expect(vm.$el.textContent).toBe('hello world')
        vm.$children[0].prop = 'bye'
        _.nextTick(function () {
          expect(vm.$el.textContent).toBe('bye world')
          done()
        })
      })

    })

    it('should not warn for non-required, absent prop', function () {
      new Vue({
        el: el,
        template: '<test></test>',
        components: {
          test: {
            props: {
              prop: {
                type: String
              }
            }
          }
        }
      })
      expect(_.warn).not.toHaveBeenCalled()
    })
  })
}
