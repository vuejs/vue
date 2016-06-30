var Vue = require('src')

describe('prop', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('one way binding', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        b: 'bar'
      },
      template: '<test v-bind:b="b" v-ref:child></test>',
      components: {
        test: {
          props: ['b'],
          template: '{{b}}'
        }
      }
    })
    expect(el.innerHTML).toBe('<test>bar</test>')
    vm.b = 'baz'
    Vue.nextTick(function () {
      expect(el.innerHTML).toBe('<test>baz</test>')
      vm.$refs.child.b = 'qux'
      expect(vm.b).toBe('baz')
      Vue.nextTick(function () {
        expect(el.innerHTML).toBe('<test>qux</test>')
        done()
      })
    })
  })

  it('with filters', function (done) {
    var vm = new Vue({
      el: el,
      template: '<test :name="a | test"></test>',
      data: {
        a: 123
      },
      filters: {
        test: function (v) {
          return v * 2
        }
      },
      components: {
        test: {
          props: ['name'],
          template: '{{name}}'
        }
      }
    })
    expect(el.textContent).toBe('246')
    vm.a = 234
    Vue.nextTick(function () {
      expect(el.textContent).toBe('468')
      done()
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
      template: '<test v-bind:testt.sync="test" :bb.sync="b" :a.sync=" test.a " v-ref:child></test>',
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
    Vue.nextTick(function () {
      expect(el.firstChild.textContent).toBe('AA BB AA')
      vm.test = { a: 'foo' }
      Vue.nextTick(function () {
        expect(el.firstChild.textContent).toBe('foo BB foo')
        vm.$data = {
          b: 'bar',
          test: {
            a: 'fooA'
          }
        }
        Vue.nextTick(function () {
          expect(el.firstChild.textContent).toBe('fooA bar fooA')
          // test two-way
          vm.$refs.child.bb = 'B'
          vm.$refs.child.testt = { a: 'A' }
          Vue.nextTick(function () {
            expect(el.firstChild.textContent).toBe('A B A')
            expect(vm.test.a).toBe('A')
            expect(vm.test).toBe(vm.$refs.child.testt)
            expect(vm.b).toBe('B')
            vm.$refs.child.a = 'Oops'
            Vue.nextTick(function () {
              expect(el.firstChild.textContent).toBe('Oops B Oops')
              expect(vm.test.a).toBe('Oops')
              done()
            })
          })
        })
      })
    })
  })

  it('explicit one time binding', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        b: 'foo'
      },
      template: '<test :b.once="b" v-ref:child></test>',
      components: {
        test: {
          props: ['b'],
          template: '{{b}}'
        }
      }
    })
    expect(el.innerHTML).toBe('<test>foo</test>')
    vm.b = 'bar'
    Vue.nextTick(function () {
      expect(el.innerHTML).toBe('<test>foo</test>')
      done()
    })
  })

  it('warn non-settable parent path', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        b: 'foo'
      },
      template: '<test :b.sync=" b + \'bar\'" v-ref:child></test>',
      components: {
        test: {
          props: ['b'],
          template: '{{b}}'
        }
      }
    })
    expect('Cannot bind two-way prop with non-settable parent path').toHaveBeenWarned()
    expect(el.innerHTML).toBe('<test>foobar</test>')
    vm.b = 'baz'
    Vue.nextTick(function () {
      expect(el.innerHTML).toBe('<test>bazbar</test>')
      vm.$refs.child.b = 'qux'
      Vue.nextTick(function () {
        expect(vm.b).toBe('baz')
        expect(el.innerHTML).toBe('<test>qux</test>')
        done()
      })
    })
  })

  it('warn expect two-way', function () {
    new Vue({
      el: el,
      template: '<test :test="foo"></test>',
      data: {
        foo: 'bar'
      },
      components: {
        test: {
          props: {
            test: {
              twoWay: true
            }
          }
        }
      }
    })
    expect('expects a two-way binding type').toHaveBeenWarned()
  })

  it('warn $data as prop', function () {
    new Vue({
      el: el,
      template: '<test></test>',
      data: {
        foo: 'bar'
      },
      components: {
        test: {
          props: ['$data']
        }
      }
    })
    expect('Do not use $data as prop').toHaveBeenWarned()
  })

  it('warn invalid keys', function () {
    new Vue({
      el: el,
      template: '<test :a.b.c="test"></test>',
      components: {
        test: {
          props: ['a.b.c']
        }
      }
    })
    expect('Invalid prop key').toHaveBeenWarned()
  })

  it('warn props with no el option', function () {
    new Vue({
      props: ['a']
    })
    expect('Props will not be compiled if no `el`').toHaveBeenWarned()
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
    expect('use a factory function to return the default value').toHaveBeenWarned()
    expect(getWarnCount()).toBe(2)
  })

  it('teardown', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        a: 'A',
        b: 'B'
      },
      template: '<test :aa.sync="a" :bb="b"></test>',
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
    Vue.nextTick(function () {
      expect(el.firstChild.textContent).toBe('AA BB')
      expect(vm.a).toBe('AA')
      // unbind the two props
      child._directives[0].unbind()
      child._directives[1].unbind()
      child.aa = 'foo'
      vm.b = 'BBB'
      Vue.nextTick(function () {
        expect(el.firstChild.textContent).toBe('foo BB')
        expect(vm.a).toBe('AA')
        done()
      })
    })
  })

  it('block instance with replace:true', function () {
    new Vue({
      el: el,
      template: '<test :b="a" :c="d"></test>',
      data: {
        a: 'foo',
        d: 'bar'
      },
      components: {
        test: {
          props: ['b', 'c'],
          template: '<p>{{b}}</p><p>{{c}}</p>',
          replace: true
        }
      }
    })
    expect(el.innerHTML).toBe('<p>foo</p><p>bar</p>')
  })

  describe('assertions', function () {
    function makeInstance (value, type, validator, coerce, required) {
      return new Vue({
        el: document.createElement('div'),
        template: '<test :test="val"></test>',
        data: {
          val: value
        },
        components: {
          test: {
            props: {
              test: {
                type: type,
                validator: validator,
                coerce: coerce,
                required: required
              }
            }
          }
        }
      })
    }

    it('string', function () {
      makeInstance('hello', String)
      expect(getWarnCount()).toBe(0)
      makeInstance(123, String)
      expect('Expected String').toHaveBeenWarned()
    })

    it('number', function () {
      makeInstance(123, Number)
      expect(getWarnCount()).toBe(0)
      makeInstance('123', Number)
      expect('Expected Number').toHaveBeenWarned()
    })

    it('boolean', function () {
      makeInstance(true, Boolean)
      expect(getWarnCount()).toBe(0)
      makeInstance('123', Boolean)
      expect('Expected Boolean').toHaveBeenWarned()
    })

    it('function', function () {
      makeInstance(function () {}, Function)
      expect(getWarnCount()).toBe(0)
      makeInstance(123, Function)
      expect('Expected Function').toHaveBeenWarned()
    })

    it('object', function () {
      makeInstance({}, Object)
      expect(getWarnCount()).toBe(0)
      makeInstance([], Object)
      expect('Expected Object').toHaveBeenWarned()
    })

    it('array', function () {
      makeInstance([], Array)
      expect(getWarnCount()).toBe(0)
      makeInstance({}, Array)
      expect('Expected Array').toHaveBeenWarned()
    })

    it('custom constructor', function () {
      function Class () {}
      makeInstance(new Class(), Class)
      expect(getWarnCount()).toBe(0)
      makeInstance({}, Class)
      expect('Expected custom type').toHaveBeenWarned()
    })

    it('multiple types', function () {
      makeInstance([], [Array, Number, Boolean])
      expect(getWarnCount()).toBe(0)
      makeInstance({}, [Array, Number, Boolean])
      expect('Expected Array, Number, Boolean').toHaveBeenWarned()
    })

    it('custom validator', function () {
      makeInstance(123, null, function (v) {
        return v === 123
      })
      expect(getWarnCount()).toBe(0)
      makeInstance(123, null, function (v) {
        return v === 234
      })
      expect('custom validator check failed').toHaveBeenWarned()
    })

    it('type check + custom validator', function () {
      makeInstance(123, Number, function (v) {
        return v === 123
      })
      expect(getWarnCount()).toBe(0)
      makeInstance(123, Number, function (v) {
        return v === 234
      })
      expect('custom validator check failed').toHaveBeenWarned()
      makeInstance(123, String, function (v) {
        return v === 123
      })
      expect('Expected String').toHaveBeenWarned()
    })

    it('multiple types + custom validator', function () {
      makeInstance(123, [Number, String, Boolean], function (v) {
        return v === 123
      })
      expect(getWarnCount()).toBe(0)
      makeInstance(123, [Number, String, Boolean], function (v) {
        return v === 234
      })
      expect('custom validator check failed').toHaveBeenWarned()
      makeInstance(123, [String, Boolean], function (v) {
        return v === 123
      })
      expect('Expected String, Boolean').toHaveBeenWarned()
    })

    it('type check + coerce', function () {
      makeInstance(123, String, null, String)
      expect(getWarnCount()).toBe(0)
      makeInstance('123', Number, null, Number)
      expect(getWarnCount()).toBe(0)
      makeInstance('123', Boolean, null, function (val) {
        return val === '123'
      })
      expect(getWarnCount()).toBe(0)
    })

    it('warn if coerce is not a function', function () {
      var coerce = 1
      makeInstance('123', String, null, coerce)
      expect(getWarnCount()).toBe(1)
    })

    it('multiple types + custom validator', function () {
      makeInstance(123, [String, Boolean, Number], null, String)
      expect(getWarnCount()).toBe(0)
      makeInstance('123', [String, Boolean, Number], null, Number)
      expect(getWarnCount()).toBe(0)
      makeInstance('123', [String, Boolean, Function], null, function (val) {
        return val === '123'
      })
      expect(getWarnCount()).toBe(0)
    })

    it('required', function () {
      new Vue({
        el: document.createElement('div'),
        template: '<test></test>',
        components: {
          test: {
            props: {
              prop: { required: true }
            }
          }
        }
      })
      expect('Missing required prop').toHaveBeenWarned()
    })

    it('optional with type + null/undefined', function () {
      makeInstance(undefined, String)
      expect(getWarnCount()).toBe(0)
      makeInstance(null, String)
      expect(getWarnCount()).toBe(0)
    })

    it('required with type + null/undefined', function () {
      makeInstance(undefined, String, null, null, true)
      expect(getWarnCount()).toBe(1)
      expect('Expected String').toHaveBeenWarned()
      makeInstance(null, Boolean, null, null, true)
      expect(getWarnCount()).toBe(2)
      expect('Expected Boolean').toHaveBeenWarned()
    })
  })

  it('alternative syntax', function () {
    new Vue({
      el: el,
      template: '<test :b="a" :c="d"></test>',
      data: {
        a: 'foo',
        d: 'bar'
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
    expect('Missing required prop').toHaveBeenWarned()
    expect('Expected Number').toHaveBeenWarned()
    expect(el.textContent).toBe('foo')
  })

  it('mixed syntax', function () {
    new Vue({
      el: el,
      template: '<test :b="a" :c="d"></test>',
      data: {
        a: 'foo',
        d: 'bar'
      },
      components: {
        test: {
          props: [
            'b',
            {
              name: 'c',
              type: Number
            },
            {
              name: 'd',
              required: true
            }
          ],
          template: '<p>{{b}}</p><p>{{c}}</p>'
        }
      }
    })
    expect('Missing required prop').toHaveBeenWarned()
    expect('Expected Number').toHaveBeenWarned()
    expect(el.textContent).toBe('foo')
  })

  it('should respect default value of a Boolean prop', function () {
    var vm = new Vue({
      el: el,
      template: '<test></test>',
      components: {
        test: {
          props: {
            prop: {
              type: Boolean,
              default: true
            }
          },
          template: '{{prop}}'
        }
      }
    })
    expect(vm.$el.textContent).toBe('true')
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
            },
            prop2: {
              type: Object,
              default: function () {
                return { vm: this }
              }
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
    // object/array default value initializers should be
    // called with the correct `this` context
    var child = vm.$children[0]
    expect(child.prop2.vm).toBe(child)
    vm.$children[0].prop = 'bye'
    Vue.nextTick(function () {
      expect(vm.$el.textContent).toBe('bye world')
      done()
    })
  })

  it('should warn data fields already defined as a prop', function () {
    var Comp = Vue.extend({
      data: function () {
        return { a: 123 }
      },
      props: {
        a: null
      }
    })
    new Vue({
      el: el,
      template: '<comp a="1"></comp>',
      components: {
        comp: Comp
      }
    })
    expect('already defined as a prop').toHaveBeenWarned()
  })

  it('propsData options', function () {
    var vm = new Vue({
      el: el,
      props: {
        a: null
      },
      propsData: {
        a: 123
      }
    })
    expect(getWarnCount()).toBe(0)
    expect(vm.a).toBe(123)
  })

  // # GitHub issues #3183
  it('pass propsData to create component that props is defined', function () {
    var Comp = Vue.extend({
      template: '<div>{{propA.a}}:{{propB.b}}</div>',
      props: {
        propA: {
          type: Object,
          required: true
        },
        'prop-b': {
          type: Object,
          required: true
        }
      }
    })
    var vm = new Comp({
      el: el,
      propsData: {
        propA: { a: 123 },
        propB: { b: '456' }
      }
    })
    expect(vm.propA.a).toBe(123)
    expect(vm.propB.b).toBe('456')
    expect('Missing required prop: propA').not.toHaveBeenWarned()
    expect('Invalid prop: type check failed for prop "propA". Expected Object, got Undefined').not.toHaveBeenWarned()
    expect('Missing required prop: prop-b').not.toHaveBeenWarned()
    expect('Invalid prop: type check failed for prop "prop-b". Expected Object, got Undefined').not.toHaveBeenWarned()
  })

  it('should warn using propsData during extension', function () {
    Vue.extend({
      propsData: {
        a: 123
      }
    })
    expect('propsData can only be used as an instantiation option').toHaveBeenWarned()
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
    expect(getWarnCount()).toBe(0)
  })

  // #1683
  it('should properly sync back up when mutating then replace', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: [1, 2]
      },
      template: '<comp :items.sync="items"></comp>',
      components: {
        comp: {
          props: ['items']
        }
      }
    })
    var child = vm.$children[0]
    child.items.push(3)
    var newArray = child.items = [4]
    Vue.nextTick(function () {
      expect(child.items).toBe(newArray)
      expect(vm.items).toBe(newArray)
      done()
    })
  })

  it('treat boolean props properly', function () {
    var vm = new Vue({
      el: el,
      template: '<comp v-ref:child prop-a prop-b="prop-b"></comp>',
      components: {
        comp: {
          props: {
            propA: Boolean,
            propB: Boolean,
            propC: Boolean
          }
        }
      }
    })
    expect(vm.$refs.child.propA).toBe(true)
    expect(vm.$refs.child.propB).toBe(true)
    expect(vm.$refs.child.propC).toBe(false)
  })

  it('detect possible camelCase prop usage', function () {
    new Vue({
      el: el,
      template: '<comp propA="true" :propB="true" v-bind:propC.sync="true"></comp>',
      components: {
        comp: {
          props: ['propA', 'propB', 'prop-c']
        }
      }
    })
    expect(getWarnCount()).toBe(3)
    expect('did you mean `prop-a`').toHaveBeenWarned()
    expect('did you mean `prop-b`').toHaveBeenWarned()
    expect('did you mean `prop-c`').toHaveBeenWarned()
  })

  it('should use default for undefined values', function (done) {
    var vm = new Vue({
      el: el,
      template: '<comp :a="a"></comp>',
      data: {
        a: undefined
      },
      components: {
        comp: {
          template: '{{a}}',
          props: {
            a: {
              default: 1
            }
          }
        }
      }
    })
    expect(vm.$el.textContent).toBe('1')
    vm.a = 2
    Vue.nextTick(function () {
      expect(vm.$el.textContent).toBe('2')
      vm.a = undefined
      Vue.nextTick(function () {
        expect(vm.$el.textContent).toBe('1')
        done()
      })
    })
  })

  it('non reactive values passed down as prop should not be converted', function (done) {
    var a = Object.freeze({
      nested: {
        msg: 'hello'
      }
    })
    var parent = new Vue({
      el: el,
      template: '<comp :a="a.nested"></comp>',
      data: {
        a: a
      },
      components: {
        comp: {
          props: ['a']
        }
      }
    })
    var child = parent.$children[0]
    expect(child.a.msg).toBe('hello')
    expect(child.a.__ob__).toBeUndefined() // should not be converted
    parent.a = Object.freeze({
      nested: {
        msg: 'yo'
      }
    })
    Vue.nextTick(function () {
      expect(child.a.msg).toBe('yo')
      expect(child.a.__ob__).toBeUndefined()
      done()
    })
  })

  it('inline prop values should be converted', function (done) {
    var vm = new Vue({
      el: el,
      template: '<comp :a="[1, 2, 3]"></comp>',
      components: {
        comp: {
          props: ['a'],
          template: '<div v-for="i in a">{{ i }}</div>'
        }
      }
    })
    expect(vm.$el.textContent).toBe('123')
    vm.$children[0].a.pop()
    Vue.nextTick(function () {
      expect(vm.$el.textContent).toBe('12')
      done()
    })
  })

  // #2549
  it('mutating child prop binding should be reactive', function (done) {
    var vm = new Vue({
      el: el,
      template: '<comp :list="list"></comp>',
      data: {
        list: [1, 2, 3]
      },
      components: {
        comp: {
          props: ['list'],
          template: '<div v-for="i in list">{{ i }}</div>',
          created: function () {
            this.list = [2, 3, 4]
          }
        }
      }
    })
    expect(vm.$el.textContent).toBe('234')
    vm.$children[0].list.push(5)
    Vue.nextTick(function () {
      expect(vm.$el.textContent).toBe('2345')
      done()
    })
  })

  it('prop default value should be reactive', function (done) {
    var vm = new Vue({
      el: el,
      template: '<comp :list="list"></comp>',
      data: {
        list: undefined
      },
      components: {
        comp: {
          props: {
            list: {
              default: function () {
                return [2, 3, 4]
              }
            }
          },
          template: '<div v-for="i in list">{{ i }}</div>'
        }
      }
    })
    expect(vm.$el.textContent).toBe('234')
    vm.$children[0].list.push(5)
    Vue.nextTick(function () {
      expect(vm.$el.textContent).toBe('2345')
      done()
    })
  })

  it('prop coerced value should be reactive', function (done) {
    var vm = new Vue({
      el: el,
      template: '<comp :obj="obj"></comp>',
      data: {
        obj: { ok: true }
      },
      components: {
        comp: {
          props: {
            obj: {
              coerce: function () {
                return { ok: false }
              }
            }
          },
          template: '<div>{{ obj.ok }}</div>'
        }
      }
    })
    expect(vm.$el.textContent).toBe('false')
    vm.$children[0].obj.ok = true
    Vue.nextTick(function () {
      expect(vm.$el.textContent).toBe('true')
      done()
    })
  })

  it('prop coercion should be applied after defaulting', function () {
    var vm = new Vue({
      el: el,
      template: '<comp></comp>',
      components: {
        comp: {
          props: {
            color: {
              type: String,
              default: 'blue',
              coerce: function (color) {
                return 'color-' + color
              }
            }
          },
          template: '<div>{{ color }}</div>'
        }
      }
    })
    expect(vm.$el.textContent).toBe('color-blue')
  })
})
