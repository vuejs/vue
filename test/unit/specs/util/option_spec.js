var _ = require('../../../../src/util')
var merge = require('../../../../src/util/merge-option')

describe('Util - Option merging', function () {
  
  it('default strat', function () {
    // child undefined
    var res = merge({replace:true}, {}).replace
    expect(res).toBe(true)
    // child overwrite
    var res = merge({replace:true}, {replace:false}).replace
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
  })

  it('events', function () {

    var fn1 = function () {}
    var fn2 = function () {}
    var fn3 = function () {}
    var parent = {
      events: {
        'fn1': [fn1, fn2],
        'fn2': [fn2]
      }
    }
    var child = {
      events: {
        'fn1': fn3,
        'fn3': fn3
      }
    }
    var res = merge(parent, child).events
    assertRes(res.fn1, [fn1, fn2, fn3])
    assertRes(res.fn2, [fn2])
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
    // mock vm
    var vm = {
      $parent: {
        $options: {
          directives: {
            c: asset3
          }
        }
      }
    }
    var res = merge(
      { directives: { a: asset1 }},
      { directives: { b: asset2 }},
      vm
    ).directives
    expect(res.a).toBe(asset1)
    expect(res.b).toBe(asset2)
    expect(res.c).toBe(asset3)
    // test prototypal inheritance
    var asset4 = vm.$parent.$options.directives.d = {}
    expect(res.d).toBe(asset4)
  })

  it('ignore el, data & parent when inheriting', function () {
    var res = merge({}, {el:1, data:2, parent:3})
    expect(res.el).toBeUndefined()
    expect(res.data).toBeUndefined()
    expect(res.parent).toBeUndefined()

    res = merge({}, {el:1, data:2, parent:3}, {})
    expect(res.el).toBe(1)
    expect(res.data).toBe(2)
    expect(res.parent).toBe(3)
  })

})