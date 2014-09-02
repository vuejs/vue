var Binding = require('../../../src/binding')

describe('Binding', function () {

  var b
  beforeEach(function () {
    b = new Binding()
  })

  it('addSub', function () {
    var sub = {}
    b.addSub(sub)
    expect(b.subs.length).toBe(1)
    expect(b.subs.indexOf(sub)).toBe(0)
  })

  it('removeSub', function () {
    var sub = {}
    b.addSub(sub)
    b.removeSub(sub)
    expect(b.subs.length).toBe(0)
    expect(b.subs.indexOf(sub)).toBe(-1)
  })

  it('notify', function () {
    var sub = {
      update: jasmine.createSpy('sub')
    }
    b.addSub(sub)
    b.notify()
    expect(sub.update).toHaveBeenCalled()
  })

})