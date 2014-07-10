var Observer = require('../../src/observer/observer')
var delimiter = Observer.pathDelimiter

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
    expect(spy).toHaveBeenCalledWith('b' + delimiter + 'c', 4, undefined)
  })

  it('should emit get events', function () {
    // body...
  })

  it('should emit mutation events on Array mutation', function () {
    // body...
  })

  it('should emit ', function () {
    // body...
  })

})