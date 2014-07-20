/**
 * Test data observation.
 */

var Observer = require('../../src/observe/observer')
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
    expect(spy.callCount).toEqual(1)

    t = obj.b.c
    expect(spy).toHaveBeenCalledWith('b', u, u)
    expect(spy).toHaveBeenCalledWith('b.c', u, u)
    expect(spy.callCount).toEqual(3)

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
    expect(spy.callCount).toEqual(1)

    obj.b.c = 4
    expect(spy).toHaveBeenCalledWith('b.c', 4, u)
    expect(spy.callCount).toEqual(2)

    // swap set
    var newB = { c: 5 }
    obj.b = newB
    expect(spy).toHaveBeenCalledWith('b', newB, u)
    expect(spy.callCount).toEqual(3)

    // same value set should not emit events
    obj.a = 3
    expect(spy.callCount).toEqual(3)
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
    expect(spy.callCount).toEqual(2)

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
    expect(spy.mostRecentCall.args[0]).toEqual('')
    expect(spy.mostRecentCall.args[1]).toEqual(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toEqual('push')
    expect(mutation.index).toEqual(2)
    expect(mutation.removed.length).toEqual(0)
    expect(mutation.inserted.length).toEqual(1)
    expect(mutation.inserted[0]).toEqual(arr[2])
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
    expect(spy.mostRecentCall.args[0]).toEqual('')
    expect(spy.mostRecentCall.args[1]).toEqual(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toEqual('pop')
    expect(mutation.index).toEqual(1)
    expect(mutation.inserted.length).toEqual(0)
    expect(mutation.removed.length).toEqual(1)
    expect(mutation.removed[0]).toEqual(popped)
  })

  it('array shift', function () {
    var arr = [{a:1}, {a:2}]
    var shifted = arr[0]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    arr.shift()
    expect(spy.mostRecentCall.args[0]).toEqual('')
    expect(spy.mostRecentCall.args[1]).toEqual(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toEqual('shift')
    expect(mutation.index).toEqual(0)
    expect(mutation.inserted.length).toEqual(0)
    expect(mutation.removed.length).toEqual(1)
    expect(mutation.removed[0]).toEqual(shifted)
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
    expect(spy.mostRecentCall.args[0]).toEqual('')
    expect(spy.mostRecentCall.args[1]).toEqual(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toEqual('unshift')
    expect(mutation.index).toEqual(0)
    expect(mutation.removed.length).toEqual(0)
    expect(mutation.inserted.length).toEqual(1)
    expect(mutation.inserted[0]).toEqual(unshifted)
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
    expect(spy.mostRecentCall.args[0]).toEqual('')
    expect(spy.mostRecentCall.args[1]).toEqual(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toEqual('splice')
    expect(mutation.index).toEqual(1)
    expect(mutation.removed.length).toEqual(1)
    expect(mutation.inserted.length).toEqual(1)
    expect(mutation.removed[0]).toEqual(removed)
    expect(mutation.inserted[0]).toEqual(inserted)
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
    expect(spy.mostRecentCall.args[0]).toEqual('')
    expect(spy.mostRecentCall.args[1]).toEqual(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toEqual('sort')
    expect(mutation.index).toBeUndefined()
    expect(mutation.removed.length).toEqual(0)
    expect(mutation.inserted.length).toEqual(0)
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
    expect(spy.mostRecentCall.args[0]).toEqual('')
    expect(spy.mostRecentCall.args[1]).toEqual(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toEqual('reverse')
    expect(mutation.index).toBeUndefined()
    expect(mutation.removed.length).toEqual(0)
    expect(mutation.inserted.length).toEqual(0)
    // test index update after mutation
    ob.on('set', spy)
    arr[1].a = 4
    expect(spy).toHaveBeenCalledWith('1.a', 4, u)
  })

  it('object.$add', function () {
    var obj = {a:{b:1}}
    var ob = Observer.create(obj)
    ob.on('add', spy)

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

    expect(spy.mostRecentCall.args[0]).toEqual('')
    expect(spy.mostRecentCall.args[1]).toEqual(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toEqual('splice')
    expect(mutation.index).toEqual(1)
    expect(mutation.removed.length).toEqual(1)
    expect(mutation.inserted.length).toEqual(1)
    expect(mutation.removed[0]).toEqual(removed)
    expect(mutation.inserted[0]).toEqual(inserted)

    ob.on('set', spy)
    arr[1].a = 4
    expect(spy).toHaveBeenCalledWith('1.a', 4, u)
  })

  it('array.$remove', function () {
    var arr = [{a:1}, {a:2}]
    var ob = Observer.create(arr)
    ob.on('mutate', spy)
    var removed = arr.$remove(0)

    expect(spy.mostRecentCall.args[0]).toEqual('')
    expect(spy.mostRecentCall.args[1]).toEqual(arr)
    var mutation = spy.mostRecentCall.args[2]
    expect(mutation).toBeDefined()
    expect(mutation.method).toEqual('splice')
    expect(mutation.index).toEqual(0)
    expect(mutation.removed.length).toEqual(1)
    expect(mutation.inserted.length).toEqual(0)
    expect(mutation.removed[0]).toEqual(removed)

    ob.on('set', spy)
    arr[0].a = 3
    expect(spy).toHaveBeenCalledWith('0.a', 3, u)
  })

})