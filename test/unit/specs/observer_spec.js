/**
 * Test data observation.
 */

var Observer = require('../../../src/observe/observer')
var _ = require('../../../src/util')
// internal emitter has fixed 3 arguments
// so we need to fill up the assetions with undefined
var u = undefined
Observer.pathDelimiter = '.'

describe('Observer', function () {

  var spy
  beforeEach(function () {
    spy = jasmine.createSpy('observer')
  })

  it('get', function () {

    Observer.emitGet = true

    var obj = {
      a: 1,
      b: {
        c: 2
      }
    }
    var ob = Observer.create(obj)
    ob.on('get', spy)

    var t = obj.a
    expect(spy).toHaveBeenCalledWith('a', u, u)
    expect(spy.callCount).toBe(1)

    t = obj.b.c
    expect(spy).toHaveBeenCalledWith('b', u, u)
    expect(spy).toHaveBeenCalledWith('b.c', u, u)
    expect(spy.callCount).toBe(3)

    Observer.emitGet = false
  })

  it('set', function () {
    var obj = {
      a: 1,
      b: {
        c: 2
      }
    }
    var ob = Observer.create(obj)
    ob.on('set', spy)

    obj.a = 3
    expect(spy).toHaveBeenCalledWith('a', 3, u)
    expect(spy.callCount).toBe(1)

    obj.b.c = 4
    expect(spy).toHaveBeenCalledWith('b.c', 4, u)
    expect(spy.callCount).toBe(2)

    // swap set
    var newB = { c: 5 }
    obj.b = newB
    expect(spy).toHaveBeenCalledWith('b', newB, u)
    expect(spy.callCount).toBe(3)

    // same value set should not emit events
    obj.a = 3
    expect(spy.callCount).toBe(3)
  })

  it('ignore prefix', function () {
    var obj = {
      _test: 123,
      $test: 234
    }
    var ob = Observer.create(obj)
    ob.on('set', spy)
    obj._test = 234
    obj.$test = 345
    expect(spy.callCount).toBe(0)
  })

  it('ignore accessors', function () {
    var obj = {
      a: 123,
      get b () {
        return this.a
      }
    }
    var ob = Observer.create(obj)
    obj.a = 234
    expect(obj.b).toBe(234)
  })

  it('warn duplicate value', function () {
    spyOn(_, 'warn')
    var obj = {
      a: { b: 123 },
      b: null
    }
    var ob = Observer.create(obj)
    obj.b = obj.a
    expect(_.warn).toHaveBeenCalled()
  })

  it('array get', function () {

    Observer.emitGet = true

    var obj = {
      arr: [{a:1}, {a:2}]
    }
    var ob = Observer.create(obj)
    ob.on('get', spy)

    var t = obj.arr[0].a
    expect(spy).toHaveBeenCalledWith('arr', u, u)
    expect(spy).toHaveBeenCalledWith('arr.0.a', u, u)
    expect(spy.callCount).toBe(2)

    Observer.emitGet = false
  })

  it('array set', function () {
    var obj = {
      arr: [{a:1}, {a:2}]
    }
    var ob = Observer.create(obj)
    ob.on('set', spy)

    obj.arr[0].a = 2
    expect(spy).toHaveBeenCalledWith('arr.0.a', 2, u)

    // set events after mutation
    obj.arr.reverse()
    obj.arr[0].a = 3
    expect(spy).toHaveBeenCalledWith('arr.0.a', 3, u)
  })

  it('array push', function () {
    var arr = [{a:1}, {a:2}]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    arr.push({a:3})
    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('push')
    expect(mutation.index).toBe(2)
    expect(mutation.removed.length).toBe(0)
    expect(mutation.inserted.length).toBe(1)
    expect(mutation.inserted[0]).toBe(arr[2])
    // test index update after mutation
    ob.on('set', spy)
    arr[2].a = 4
    expect(spy).toHaveBeenCalledWith('2.a', 4, u)
  })

  it('array pop', function () {
    var arr = [{a:1}, {a:2}]
    var popped = arr[1]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    arr.pop()
    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('pop')
    expect(mutation.index).toBe(1)
    expect(mutation.inserted.length).toBe(0)
    expect(mutation.removed.length).toBe(1)
    expect(mutation.removed[0]).toBe(popped)
  })

  it('array shift', function () {
    var arr = [{a:1}, {a:2}]
    var shifted = arr[0]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    arr.shift()
    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('shift')
    expect(mutation.index).toBe(0)
    expect(mutation.inserted.length).toBe(0)
    expect(mutation.removed.length).toBe(1)
    expect(mutation.removed[0]).toBe(shifted)
    // test index update after mutation
    ob.on('set', spy)
    arr[0].a = 4
    expect(spy).toHaveBeenCalledWith('0.a', 4, u)
  })

  it('array unshift', function () {
    var arr = [{a:1}, {a:2}]
    var unshifted = {a:3}
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    arr.unshift(unshifted)
    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('unshift')
    expect(mutation.index).toBe(0)
    expect(mutation.removed.length).toBe(0)
    expect(mutation.inserted.length).toBe(1)
    expect(mutation.inserted[0]).toBe(unshifted)
    // test index update after mutation
    ob.on('set', spy)
    arr[1].a = 4
    expect(spy).toHaveBeenCalledWith('1.a', 4, u)
  })

  it('array splice', function () {
    var arr = [{a:1}, {a:2}]
    var inserted = {a:3}
    var removed = arr[1]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    arr.splice(1, 1, inserted)
    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('splice')
    expect(mutation.index).toBe(1)
    expect(mutation.removed.length).toBe(1)
    expect(mutation.inserted.length).toBe(1)
    expect(mutation.removed[0]).toBe(removed)
    expect(mutation.inserted[0]).toBe(inserted)
    // test index update after mutation
    ob.on('set', spy)
    arr[1].a = 4
    expect(spy).toHaveBeenCalledWith('1.a', 4, u)
  })

  it('array sort', function () {
    var arr = [{a:1}, {a:2}]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    arr.sort(function (a, b) {
      return a.a < b.a ? 1 : -1
    })
    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('sort')
    expect(mutation.index).toBeUndefined()
    expect(mutation.removed.length).toBe(0)
    expect(mutation.inserted.length).toBe(0)
    // test index update after mutation
    ob.on('set', spy)
    arr[1].a = 4
    expect(spy).toHaveBeenCalledWith('1.a', 4, u)
  })

  it('array reverse', function () {
    var arr = [{a:1}, {a:2}]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    arr.reverse()
    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('reverse')
    expect(mutation.index).toBeUndefined()
    expect(mutation.removed.length).toBe(0)
    expect(mutation.inserted.length).toBe(0)
    // test index update after mutation
    ob.on('set', spy)
    arr[1].a = 4
    expect(spy).toHaveBeenCalledWith('1.a', 4, u)
  })

  it('object.$add', function () {
    var obj = {a:{b:1}}
    var ob = Observer.create(obj)
    ob.on('add', spy)

    // ignore existing keys
    obj.$add('a', 123)
    expect(spy.callCount).toBe(0)

    // add event
    var add = {d:2}
    obj.a.$add('c', add)
    expect(spy).toHaveBeenCalledWith('a.c', add, u)

    // check if add object is properly observed
    ob.on('set', spy)
    obj.a.c.d = 3
    expect(spy).toHaveBeenCalledWith('a.c.d', 3, u)
  })

  it('object.$delete', function () {
    var obj = {a:{b:1}}
    var ob = Observer.create(obj)
    ob.on('delete', spy)

    // ignore non-present key
    obj.$delete('c')
    expect(spy.callCount).toBe(0)

    obj.a.$delete('b')
    expect(spy).toHaveBeenCalledWith('a.b', u, u)
  })

  it('array.$set', function () {
    var arr = [{a:1}, {a:2}]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    var inserted = {a:3}
    var removed = arr[1]
    arr.$set(1, inserted)

    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('splice')
    expect(mutation.index).toBe(1)
    expect(mutation.removed.length).toBe(1)
    expect(mutation.inserted.length).toBe(1)
    expect(mutation.removed[0]).toBe(removed)
    expect(mutation.inserted[0]).toBe(inserted)

    ob.on('set', spy)
    arr[1].a = 4
    expect(spy).toHaveBeenCalledWith('1.a', 4, u)
  })

  it('array.$set with out of bound length', function () {
    var arr = [{a:1}, {a:2}]
    var ob = Observer.create(arr)
    var inserted = {a:3}
    arr.$set(3, inserted)
    expect(arr.length).toBe(4)
    expect(arr[2]).toBeUndefined()
    expect(arr[3]).toBe(inserted)
  })

  it('array.$remove', function () {
    var arr = [{a:1}, {a:2}]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    var removed = arr.$remove(0)

    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('splice')
    expect(mutation.index).toBe(0)
    expect(mutation.removed.length).toBe(1)
    expect(mutation.inserted.length).toBe(0)
    expect(mutation.removed[0]).toBe(removed)

    ob.on('set', spy)
    arr[0].a = 3
    expect(spy).toHaveBeenCalledWith('0.a', 3, u)
  })

  it('array.$remove object', function () {
    var arr = [{a:1}, {a:2}]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    var removed = arr.$remove(arr[0])

    expect(spy.mostRecentCall.args[0]).toBe('')
    expect(spy.mostRecentCall.args[1]).toBe(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toBe('splice')
    expect(mutation.index).toBe(0)
    expect(mutation.removed.length).toBe(1)
    expect(mutation.inserted.length).toBe(0)
    expect(mutation.removed[0]).toBe(removed)

    ob.on('set', spy)
    arr[0].a = 3
    expect(spy).toHaveBeenCalledWith('0.a', 3, u)
  })

  it('shared observe', function () {
    var obj = { a: 1 }
    var parentA = { child1: obj }
    var parentB = { child2: obj }
    var obA = Observer.create(parentA)
    var obB = Observer.create(parentB)
    obA.on('set', spy)
    obB.on('set', spy)
    obj.a = 2
    expect(spy.callCount).toBe(2)
    expect(spy).toHaveBeenCalledWith('child1.a', 2, u)
    expect(spy).toHaveBeenCalledWith('child2.a', 2, u)
    // test unobserve
    parentA.child1 = null
    obj.a = 3
    expect(spy.callCount).toBe(4)
    expect(spy).toHaveBeenCalledWith('child1', null, u)
    expect(spy).toHaveBeenCalledWith('child2.a', 3, u)
  })

})