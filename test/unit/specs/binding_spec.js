var Binding = require('../../../src/binding')

describe('Binding', function () {

  var b
  beforeEach(function () {
    b = new Binding()
  })
  
  it('addChild', function () {
    var child = new Binding()
    b._addChild('test', child)
    expect(b.test).toBe(child)
  })

  it('addSub', function () {
    var sub = {}
    b._addSub(sub)
    expect(b._subs.length).toBe(1)
    expect(b._subs.indexOf(sub)).toBe(0)
  })

  it('removeSub', function () {
    var sub = {}
    b._addSub(sub)
    b._removeSub(sub)
    expect(b._subs.length).toBe(0)
    expect(b._subs.indexOf(sub)).toBe(-1)
  })

  it('notify', function () {
    var sub = {
      update: jasmine.createSpy('sub')
    }
    b._addSub(sub)
    b._notify()
    expect(sub.update).toHaveBeenCalled()
  })

})