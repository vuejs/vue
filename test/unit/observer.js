var Observer = require('../../src/observer/observer')
var delimiter = Observer.pathDelimiter

function path (p) {
  return p.replace(/\./g, '\b')
}

describe('Observer', function () {

  var spy
  beforeEach(function () {
    spy = jasmine.createSpy()
  })

  it('get', function () {
    var obj = {
      a: 1,
      b: {
        c: 2
      }
    }
    var ob = Observer.create(obj)
    ob.on('get', spy)

    var t = obj.a
    expect(spy).toHaveBeenCalledWith('a', undefined, undefined)
    expect(spy.callCount).toEqual(1)

    t = obj.b.c
    expect(spy).toHaveBeenCalledWith('b', undefined, undefined)
    expect(spy).toHaveBeenCalledWith(path('b.c'), undefined, undefined)
    expect(spy.callCount).toEqual(3)
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
    expect(spy).toHaveBeenCalledWith('a', 3, undefined)
    expect(spy.callCount).toEqual(1)

    obj.b.c = 4
    expect(spy).toHaveBeenCalledWith(path('b.c'), 4, undefined)
    expect(spy.callCount).toEqual(2)

    var newB = { c: 5 }
    obj.b = newB
    expect(spy).toHaveBeenCalledWith('b', newB, undefined)
    expect(spy.callCount).toEqual(3)
  })

  it('array get', function () {
    var obj = {
      arr: [{a:1}, {a:2}]
    }
    var ob = Observer.create(obj)
    ob.on('get', spy)

    var t = obj.arr[0].a
    expect(spy).toHaveBeenCalledWith(path('arr'), undefined, undefined)
    expect(spy).toHaveBeenCalledWith(path('arr.0.a'), undefined, undefined)
    expect(spy.callCount).toEqual(2)
  })

  it('array set', function () {
    // body...
  })

  it('array mutate', function () {
    // body...
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