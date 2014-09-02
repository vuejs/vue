var Vue = require('../../../../src/vue')

describe('Events API', function () {

  var e, spy
  beforeEach(function () {
    e = new Vue()
    spy = jasmine.createSpy('emitter')
  })
  
  it('$on', function () {
    e.$on('test', spy)
    e.$emit('test', 1, 2 ,3, 4)
    expect(spy.calls.count()).toBe(1)
    expect(spy).toHaveBeenCalledWith(1, 2, 3, 4)
  })

  it('$once', function () {
    e.$once('test', spy)
    e.$emit('test', 1, 2 ,3)
    e.$emit('test', 2, 3, 4)
    expect(spy.calls.count()).toBe(1)
    expect(spy).toHaveBeenCalledWith(1, 2, 3)
  })

  it('$off', function () {
    e.$on('test1', spy)
    e.$on('test2', spy)
    e.$off()
    e.$emit('test1')
    e.$emit('test2')
    expect(spy.calls.count()).toBe(0)
  })

  it('$off event', function () {
    e.$on('test1', spy)
    e.$on('test2', spy)
    e.$off('test1')
    e.$off('test1') // test off something that's already off
    e.$emit('test1', 1)
    e.$emit('test2', 2)
    expect(spy.calls.count()).toBe(1)
    expect(spy).toHaveBeenCalledWith(2)
  })

  it('$off event + fn', function () {
    var spy2 = jasmine.createSpy('emitter')
    e.$on('test', spy)
    e.$on('test', spy2)
    e.$off('test', spy)
    e.$emit('test', 1, 2, 3)
    expect(spy.calls.count()).toBe(0)
    expect(spy2.calls.count()).toBe(1)
    expect(spy2).toHaveBeenCalledWith(1, 2, 3)
  })

  it('$emit cancel', function () {
    expect(e._eventCancelled).toBe(false)
    e.$on('test', function () {
      return false
    })
    e.$emit('test')
    expect(e._eventCancelled).toBe(true)
    e.$emit('other')
    expect(e._eventCancelled).toBe(false)
  })

  it('$broadcast', function () {
    // TODO
  })

  it('$dispatch', function () {
    // TODO
  })

})