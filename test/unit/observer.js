var Observer = require('../../src/observer/observer')

describe('Observer', function () {

  var obj, ob, spy

  beforeEach(function () {
    obj = {
      a: 1,
      b: {
        c: 2
      }
    }
    ob = Observer.create(obj)
    ob.init()
    spy = jasmine.createSpy()
  })

  it('should emit set events', function () {
    ob.on('set', spy)
    obj.a = 3
    expect(spy).toHaveBeenCalledWith('a', 3, undefined)
    obj.b.c = 4
    expect(spy).toHaveBeenCalledWith('b.c', 4, undefined)
  })

})