var Vue = require('src')

describe('prop', function () {

  var el
  beforeEach(function () {
    el = document.createElement('div')
    spyWarns()
  })

  it('one way binding', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        b: 'B'
      },
      template: '<test v-bind:b="b" v-ref:child></test>',
      components: {
        test: {
          props: ['b'],
          template: '{{b}}'
        }
      }
    })
    expect(el.innerHTML).toBe('<test>B</test>')
    vm.b = 'BB'
    Vue.nextTick(function () {
      expect(el.innerHTML).toBe('<test>BB</test>')
      vm.$refs.child.b = 'BBB'
      expect(vm.b).toBe('BB')
      Vue.nextTick(function () {
        expect(el.innerHTML).toBe('<test>BBB</test>')
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
      vm.test = { a: 'AAA' }
      Vue.nextTick(function () {
        expect(el.firstChild.textContent).toBe('AAA BB AAA')
        vm.$data = {
          b: 'BBB',
          test: {
            a: 'AAAA'
          }
        }
        Vue.nextTick(function () {
          expect(el.firstChild.textContent).toBe('AAAA BBB AAAA')
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
        b: 'B'
      },
      template: '<test :b.once="b" v-ref:child></test>',
      components: {
        test: {
          props: ['b'],
          template: '{{b}}'
        }
      }
    })
    expect(el.innerHTML).toBe('<test>B</test>')
    vm.b = 'BB'
    Vue.nextTick(function () {
      expect(el.innerHTML).toBe('<test>B</test>')
      done()
    })
  })

  it('warn non-settable parent path', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        b: 'B'
      },
      template: '<test :b.sync=" b + \'B\'" v-ref:child></test>',
      components: {
        test: {
          props: ['b'],
          template: '{{b}}'
        }
      }
    })
    expect(hasWarned('Cannot bind two-way prop with non-settable parent path')).toBe(true)
    expect(el.innerHTML).toBe('<test>BB</test>')
    vm.b = 'BB'
    Vue.nextTick(function () {
      expect(el.innerHTML).toBe('<test>BBB</test>')
      vm.$refs.child.b = 'hahaha'
      Vue.nextTick(function () {
        expect(vm.b).toBe('BB')
        expect(el.innerHTML).toBe('<test>hahaha</test>')
        done()
      })
    })
  })

  it('warn expect two-way', function () {
    new Vue({
      el: el,
      template: '<test :test="ok"></test>',
      data: {
        ok: 'hi'
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
    expect(hasWarned('expects a two-way binding type')).toBe(true)
  })

  it('warn $data as prop', function () {
    new Vue({
      el: el,
      template: '<test></test>',
      data: {
        ok: 'hi'
      },
      components: {
        test: {
          props: ['$data']
        }
      }
    })
    expect(hasWarned('Do not use $data as prop')).toBe(true)
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
    expect(hasWarned('Invalid prop key')).toBe(true)
  })

  it('warn props with no el option', function () {
    new Vue({
      props: ['a']
    })
    expect(hasWarned('Props will not be compiled if no `el`')).toBe(true)
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
    expect(hasWarned('Use a factory function to return the default value')).toBe(true)
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
      child.aa = 'AAA'
      vm.b = 'BBB'
      Vue.nextTick(function () {
        expect(el.firstChild.textContent).toBe('AAA BB')
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

    function makeInstance (value, type, validator, coerce) {
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
                coerce: coerce
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
      expect(hasWarned('Expected String')).toBe(true)
    })

    it('number', function () {
      makeInstance(123, Number)
      expect(getWarnCount()).toBe(0)
      makeInstance('123', Number)
      expect(hasWarned('Expected Number')).toBe(true)
    })

    it('boolean', function () {
      makeInstance(true, Boolean)
      expect(getWarnCount()).toBe(0)
      makeInstance('123', Boolean)
      expect(hasWarned('Expected Boolean')).toBe(true)
    })

    it('function', function () {
      makeInstance(function () {}, Function)
      expect(getWarnCount()).toBe(0)
      makeInstance(123, Function)
      expect(hasWarned('Expected Function')).toBe(true)
    })

    it('object', function () {
      makeInstance({}, Object)
      expect(getWarnCount()).toBe(0)
      makeInstance([], Object)
      expect(hasWarned('Expected Object')).toBe(true)
    })

    it('array', function () {
      makeInstance([], Array)
      expect(getWarnCount()).toBe(0)
      makeInstance({}, Array)
      expect(hasWarned('Expected Array')).toBe(true)
    })

    it('custom constructor', function () {
      function Class () {}
      makeInstance(new Class(), Class)
      expect(getWarnCount()).toBe(0)
      makeInstance({}, Class)
      expect(hasWarned('Expected custom type')).toBe(true)
    })

    it('custom validator', function () {
      makeInstance(123, null, function (v) {
        return v === 123
      })
      expect(getWarnCount()).toBe(0)
      makeInstance(123, null, function (v) {
        return v === 234
      })
      expect(hasWarned('custom validator check failed')).toBe(true)
    })

    it('type check + custom validator', function () {
      makeInstance(123, Number, function (v) {
        return v === 123
      })
      expect(getWarnCount()).toBe(0)
      makeInstance(123, Number, function (v) {
        return v === 234
      })
      expect(hasWarned('custom validator check failed')).toBe(true)
      makeInstance(123, String, function (v) {
        return v === 123
      })
      expect(hasWarned('Expected String')).toBe(true)
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
      expect(hasWarned('Missing required prop')).toBe(true)
    })

  })

  it('alternative syntax', function () {
    new Vue({
      el: el,
      template: '<test :b="a" :c="d"></test>',
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
    expect(hasWarned('Missing required prop')).toBe(true)
    expect(hasWarned('Expected Number')).toBe(true)
    expect(el.textContent).toBe('AAA')
  })

  it('mixed syntax', function () {
    new Vue({
      el: el,
      template: '<test :b="a" :c="d"></test>',
      data: {
        a: 'AAA',
        d: 'DDD'
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
    expect(hasWarned('Missing required prop')).toBe(true)
    expect(hasWarned('Expected Number')).toBe(true)
    expect(el.textContent).toBe('AAA')
  })

  it('should not overwrite default value for an absent Boolean prop', function () {
    var vm = new Vue({
      el: el,
      template: '<test></test>',
      components: {
        test: {
          props: {
            prop: Boolean
          },
          data: function () {
            return {
              prop: true
            }
          },
          template: '{{prop}}'
        }
      }
    })
    expect(vm.$children[0].prop).toBe(true)
    expect(vm.$el.textContent).toBe('true')
    expect(JSON.stringify(vm.$children[0].$data)).toBe(JSON.stringify({
      prop: true
    }))
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
    new Vue({
      el: el,
      props: {
        a: null
      },
      data: {
        a: 1
      }
    })
    expect(hasWarned('already defined as a prop')).toBe(true)
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
      template: '<comp v-ref:child prop-a></comp>',
      components: {
        comp: {
          props: {
            propA: Boolean,
            propB: Boolean
          }
        }
      }
    })
    expect(vm.$refs.child.propA).toBe(true)
    expect(vm.$refs.child.propB).toBe(false)
  })
})
