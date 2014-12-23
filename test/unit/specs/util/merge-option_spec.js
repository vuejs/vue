var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')
var merge = require('../../../../src/util/merge-option')

describe('Util - Option merging', function () {
  
  it('default strat', function () {
    // child undefined
    var res = merge({replace:true}, {}).replace
    expect(res).toBe(true)
    // child overwrite
    res = merge({replace:true}, {replace:false}).replace
    expect(res).toBe(false)
  })

  it('hooks & paramAttributes', function () {
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
    // both arrays
    res = merge({paramAttributes: [1]}, {paramAttributes: [2]}).paramAttributes
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(2)
    expect(res[0]).toBe(1)
    expect(res[1]).toBe(2)
  })

  it('events', function () {

    // no parent
    res = merge({}, {events:1})
    expect(res.events).toBe(1)
    // no child
    res = merge({events:1}, {})
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
    var asset3 = {}
    var asset4 = {}
    var asset5 = {}
    var res = merge(
      { directives: { a: asset1 }},
      { directives: { b: asset2 }}
    ).directives
    expect(res.a).toBe(asset1)
    expect(res.b).toBe(asset2)
    // vm asset merge should do tree-way merge
    var proto = { d: asset5 }
    var parent = { directives: Object.create(proto) }
    parent.directives.a = asset1
    parent.directives.b = asset4
    res = merge(
      parent,
      { directives: { b: asset2 }},
      {
        $parent: {
          $options: {
            directives: { c: asset3 }
          }
        }
      },
      'directives'
    ).directives
    expect(res.a).toBe(asset1)
    // child should overwrite parent
    expect(res.b).toBe(asset2)
    expect(res.c).toBe(asset3)
    // should not copy parent prototype properties
    expect(res.d).toBeUndefined()
  })

  it('guard components', function () {
    var res = merge({}, {
      components: {
        a: { template: 'hi' }
      }
    })
    expect(typeof res.components.a).toBe('function')
    expect(res.components.a.options.name).toBe('a')
    expect(res.components.a.super).toBe(Vue)
  })

  it('should ignore non-function el & data in class merge', function () {
    var res = merge({}, {el:1, data:2})
    expect(res.el).toBeUndefined()
    expect(res.data).toBeUndefined()
  })

  it('class el merge', function () {
    function fn1 () {}
    function fn2 () {}
    var res = merge({el:fn1}, {el:fn2})
    expect(res.el).toBe(fn2)
  })

  it('class data merge', function () {
    function fn1 () {
      return { a: 1, c: 4, d: { e: 1 } }
    }
    function fn2 () {
      return { a: 2, b: 3, d: { f: 2 } }
    }
    // both present
    var res = merge({data:fn1}, {data:fn2}).data()
    expect(res.a).toBe(2)
    expect(res.b).toBe(3)
    expect(res.c).toBe(4)
    expect(res.d.e).toBe(1)
    expect(res.d.f).toBe(2)
    // only parent
    res = merge({data:fn1}, {}).data()
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
    var res = merge({el:fn1}, {el:fn2}, vm)
    expect(res.el).toBe(2)
    // direct instance el
    res = merge({el:fn1}, {el:2}, vm)
    expect(res.el).toBe(2)
    // no parent
    res = merge({}, {el:2}, vm)
    expect(res.el).toBe(2)
    // no child
    res = merge({el:fn1}, {}, vm)
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
    expect(res.data.a).toBe(1)
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
    expect(res.data.a).toBe(2)
    expect(res.data.b).toBe(2)
  })

  it('already observed instance data merge with default data', function () {
    var Observer = require('../../../../src/observer')
    var instanceData = { a: 123 }
    // observe it
    Observer.create(instanceData)
    var res = merge(
      {
        data: function () { return { b: 234} }
      },
      {
        data: instanceData
      },
      {}
    )
    expect(res.data.a).toBe(123)
    expect(res.data.b).toBe(234)
    expect(Object.getOwnPropertyDescriptor(res.data, 'b').get).toBeTruthy()
  })

  it('mixins', function () {
    var a = {}, b = {}, c = {}, d = {}
    var f1 = function () {}
    var f2 = function () {}
    var f3 = function () {}
    var f4 = function () {}
    var mixinA = { a: 1, directives: { a: a }, created: f2 }
    var mixinB = { b: 1, directives: { b: b }, created: f3 }
    var res = merge(
      { a: 2, directives: { c: c }, created: [f1] },
      { directives: { d: d }, mixins: [mixinA, mixinB], created: f4 }
    )
    expect(res.a).toBe(1)
    expect(res.b).toBe(1)
    expect(res.directives.a).toBe(a)
    expect(res.directives.b).toBe(b)
    expect(res.directives.c).toBe(c)
    expect(res.directives.d).toBe(d)
    expect(res.created[0]).toBe(f1)
    expect(res.created[1]).toBe(f2)
    expect(res.created[2]).toBe(f3)
    expect(res.created[3]).toBe(f4)
  })

})