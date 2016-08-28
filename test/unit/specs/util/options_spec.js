var _ = require('src/util')
var Vue = require('src')
var merge = _.mergeOptions
var resolveAsset = _.resolveAsset

describe('Util - Option merging', function () {
  it('default strat', function () {
    // child undefined
    var res = merge({replace: true}, {}).replace
    expect(res).toBe(true)
    // child overwrite
    res = merge({replace: true}, {replace: false}).replace
    expect(res).toBe(false)
  })

  it('hooks', function () {
    var fn1 = function () {}
    var fn2 = function () {}
    var res
    // parent undefined
    res = merge({}, {created: fn1}).created
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(1)
    expect(res[0]).toBe(fn1)
    // child undefined
    res = merge({created: [fn1]}, {}).created
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(1)
    expect(res[0]).toBe(fn1)
    // both defined
    res = merge({created: [fn1]}, {created: fn2}).created
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(2)
    expect(res[0]).toBe(fn1)
    expect(res[1]).toBe(fn2)
  })

  it('events', function () {
    // no parent
    res = merge({}, {events: 1})
    expect(res.events).toBe(1)
    // no child
    res = merge({events: 1}, {})
    expect(res.events).toBe(1)

    var fn1 = function () {}
    var fn2 = function () {}
    var fn3 = function () {}
    var parent = {
      events: {
        'fn1': [fn1, fn2],
        'fn2': fn2
      }
    }
    var child = {
      events: {
        'fn1': fn3,
        'fn2': fn3,
        'fn3': fn3
      }
    }
    var res = merge(parent, child).events
    assertRes(res.fn1, [fn1, fn2, fn3])
    assertRes(res.fn2, [fn2, fn3])
    assertRes(res.fn3, [fn3])

    function assertRes (res, expected) {
      expect(Array.isArray(res)).toBe(true)
      expect(res.length).toBe(expected.length)
      var i = expected.length
      while (i--) {
        expect(res[i]).toBe(expected[i])
      }
    }
  })

  it('normal object hashes', function () {
    var fn1 = function () {}
    var fn2 = function () {}
    var res
    // parent undefined
    res = merge({}, {methods: {test: fn1}}).methods
    expect(res.test).toBe(fn1)
    // child undefined
    res = merge({methods: {test: fn1}}, {}).methods
    expect(res.test).toBe(fn1)
    // both defined
    var parent = {methods: {test: fn1}}
    res = merge(parent, {methods: {test2: fn2}}).methods
    expect(res.test).toBe(fn1)
    expect(res.test2).toBe(fn2)
  })

  it('assets', function () {
    var asset1 = {}
    var asset2 = {}
    var res = merge(
      { directives: { a: asset1 }},
      { directives: { b: asset2 }}
    ).directives
    expect(res.a).toBe(asset1)
    expect(res.b).toBe(asset2)
  })

  it('props', function () {
    var res = merge({
      props: {
        a: null,
        d: null
      }
    }, {
      props: {
        a: { required: true },
        b: Boolean,
        c: { type: Array }
      }
    })
    expect(typeof res.props.a).toBe('object')
    expect(res.props.a.required).toBe(true)
    expect(typeof res.props.b).toBe('object')
    expect(res.props.b.type).toBe(Boolean)
    expect(typeof res.props.c).toBe('object')
    expect(res.props.c.type).toBe(Array)
    expect(res.props.d).toBe(null)

    // check array syntax
    res = merge({
      props: {
        b: null
      }
    }, {
      props: ['a']
    })
    expect(res.props.a).toBe(null)
    expect(res.props.b).toBe(null)
  })

  it('guard components', function () {
    var res = merge({
      components: null
    }, {
      components: {
        test: { template: 'foo' }
      }
    })
    expect(typeof res.components.test).toBe('function')
    expect(res.components.test.super).toBe(Vue)
  })

  it('guard components warn built-in elements', function () {
    merge({
      components: null
    }, {
      components: {
        a: { template: 'foo' }
      }
    })
    expect('Do not use built-in or reserved HTML elements as component id: a').toHaveBeenWarned()
    merge({
      components: null
    }, {
      components: {
        slot: { template: 'foo' }
      }
    })
    expect('Do not use built-in or reserved HTML elements as component id: slot').toHaveBeenWarned()
  })

  it('should ignore non-function el & data in class merge', function () {
    var res = merge({}, {el: 1, data: 2})
    expect(res.el).toBeUndefined()
    expect(res.data).toBeUndefined()
  })

  it('class el merge', function () {
    function fn1 () {}
    function fn2 () {}
    var res = merge({ el: fn1 }, { el: fn2 })
    expect(res.el).toBe(fn2)
  })

  it('class data merge', function () {
    function fn1 () {
      return { a: 1, c: 4, d: { e: 1 }}
    }
    function fn2 () {
      return { a: 2, b: 3, d: { f: 2 }}
    }
    // both present
    var res = merge({ data: fn1 }, { data: fn2 }).data()
    expect(res.a).toBe(2)
    expect(res.b).toBe(3)
    expect(res.c).toBe(4)
    expect(res.d.e).toBe(1)
    expect(res.d.f).toBe(2)
    // only parent
    res = merge({ data: fn1 }, {}).data()
    expect(res.a).toBe(1)
    expect(res.b).toBeUndefined()
    expect(res.c).toBe(4)
    expect(res.d.e).toBe(1)
    expect(res.d.f).toBeUndefined()
  })

  it('instanace el merge', function () {
    var vm = {} // mock vm presence
    function fn1 () {
      expect(this).toBe(vm)
      return 1
    }
    function fn2 () {
      expect(this).toBe(vm)
      return 2
    }
    // both functions
    var res = merge({ el: fn1 }, { el: fn2 }, vm)
    expect(res.el).toBe(2)
    // direct instance el
    res = merge({ el: fn1 }, { el: 2 }, vm)
    expect(res.el).toBe(2)
    // no parent
    res = merge({}, { el: 2 }, vm)
    expect(res.el).toBe(2)
    // no child
    res = merge({ el: fn1 }, {}, vm)
    expect(res.el).toBe(1)
  })

  it('instance data merge with no instance data', function () {
    var res = merge(
      {data: function () {
        return { a: 1}
      }},
      {}, // no instance data
      {} // mock vm presence
    )
    expect(res.data().a).toBe(1)
  })

  it('instance data merge with default data function', function () {
    var vm = {} // mock vm presence
    var res = merge(
      // component default
      { data: function () {
        expect(this).toBe(vm)
        return {
          a: 1,
          b: 2
        }
      }},
      { data: { a: 2 }}, // instance data
      vm
    )
    var data = res.data()
    expect(data.a).toBe(2)
    expect(data.b).toBe(2)
  })

  it('already observed instance data merge with default data', function () {
    var observe = require('src/observer').observe
    var instanceData = { a: 123 }
    // observe it
    observe(instanceData)
    var res = merge(
      {
        data: function () {
          return { b: 234 }
        }
      },
      {
        data: instanceData
      },
      {}
    )
    var data = res.data()
    expect(data.a).toBe(123)
    expect(data.b).toBe(234)
    expect(Object.getOwnPropertyDescriptor(data, 'b').get).toBeTruthy()
  })

  it('extends', function () {
    var f1 = function () {}
    var f2 = function () {}
    var f3 = function () {}
    var componentA = Vue.extend({ template: 'foo', methods: { f1: f1, f2: function () {} }})
    var componentB = { extends: componentA, methods: { f2: f2 }}
    var componentC = { extends: componentB, template: 'bar', methods: { f3: f3 }}
    var res = merge({}, componentC)
    expect(res.template).toBe('bar')
    expect(res.methods.f1).toBe(f1)
    expect(res.methods.f2).toBe(f2)
    expect(res.methods.f3).toBe(f3)
  })

  it('mixins', function () {
    var a = {}
    var b = {}
    var c = {}
    var d = {}
    var f1 = function () {}
    var f2 = function () {}
    var f3 = function () {}
    var f4 = function () {}
    var mixinA = { a: 1, directives: { a: a }, created: f2 }
    var mixinB = { b: 1, directives: { b: b }, created: f3 }
    var mixinC = Vue.extend({ c: 1 })
    var res = merge(
      { a: 2, directives: { c: c }, created: [f1] },
      { directives: { d: d }, mixins: [mixinA, mixinB, mixinC], created: f4 }
    )
    expect(res.a).toBe(1)
    expect(res.b).toBe(1)
    expect(res.c).toBe(1)
    expect(res.directives.a).toBe(a)
    expect(res.directives.b).toBe(b)
    expect(res.directives.c).toBe(c)
    expect(res.directives.d).toBe(d)
    expect(res.created[0]).toBe(f1)
    expect(res.created[1]).toBe(f2)
    expect(res.created[2]).toBe(f3)
    expect(res.created[3]).toBe(f4)
  })

  it('Array assets', function () {
    var a = {
      components: {
        a: Vue.extend({})
      }
    }
    var b = {
      components: [{ name: 'b' }]
    }
    var res = merge(a, b)
    expect(res.components.a).toBe(a.components.a)
    // b.components is guarded and converted to object hash
    expect(res.components.b).toBeTruthy()
    expect(res.components.b).toBe(b.components.b)
  })

  it('warn Array assets without id', function () {
    var a = {
      components: {
        a: Vue.extend({})
      }
    }
    var b = {
      components: [{}]
    }
    merge(a, b)
    expect('must provide a "name" or "id" field').toHaveBeenWarned()
  })

  it('warn Array async component without id', function () {
    var a = {
      components: {
        a: Vue.extend({})
      }
    }
    var b = {
      components: [function () {}]
    }
    merge(a, b)
    expect('must provide a "name" or "id" field').toHaveBeenWarned()
  })
})

describe('Util - Option resolveAsset', function () {
  var vm
  beforeEach(function () {
    vm = new Vue({
      data: {},
      components: {
        'hyphenated-component': {
          template: 'foo'
        },
        camelCasedComponent: {
          template: 'bar'
        },
        PascalCasedComponent: {
          template: 'baz'
        }
      }
    })
  })

  it('resolves', function () {
    expect(resolveAsset(vm.$options, 'components', 'hyphenated-component')).toBeTruthy()
    expect(resolveAsset(vm.$options, 'components', 'camel-cased-component')).toBeTruthy()
    expect(resolveAsset(vm.$options, 'components', 'pascal-cased-component')).toBeTruthy()
  })
})
