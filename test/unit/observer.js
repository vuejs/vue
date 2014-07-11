var Observer = require('../../src/observer/observer')
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

  it('array mutate', function () {
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
    expect(mutation.inserted.length).toEqual(1)
    expect(mutation.inserted[0]).toEqual(arr[2])
  })

  it('array set after mutate', function () {
    var arr = [{a:1}, {a:2}]
    var ob = Observer.create(arr)
    ob.on('set', spy)
    arr.push({a:3})
    arr[2].a = 4
    expect(spy).toHaveBeenCalledWith('2.a', 4, u)
  })

  it('object.$add', function () {
    // body...
  })

  it('object.$delete', function () {
    // body...
  })

  it('array.$set', function () {
    // body...
  })

  it('array.$remove', function () {
    // body...
  })

})