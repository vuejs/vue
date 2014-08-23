var Emitter = require('../../../src/emitter')

describe('Emitter', function () {

  var e, spy
  beforeEach(function () {
    e = new Emitter()
    spy = jasmine.createSpy('emitter')
  })
  
  it('on', function () {
    e.on('test', spy)
    e.emit('test', 1, 2 ,3, 4)
    expect(spy.calls.count()).toBe(1)
    expect(spy).toHaveBeenCalledWith(1, 2, 3, 4)
  })

  it('once', function () {
    e.once('test', spy)
    e.emit('test', 1, 2 ,3)
    e.emit('test', 2, 3, 4)
    expect(spy.calls.count()).toBe(1)
    expect(spy).toHaveBeenCalledWith(1, 2, 3, undefined)
  })

  it('off', function () {
    e.on('test1', spy)
    e.on('test2', spy)
    e.off()
    e.emit('test1')
    e.emit('test2')
    expect(spy.calls.count()).toBe(0)
  })

  it('off event', function () {
    e.on('test1', spy)
    e.on('test2', spy)
    e.off('test1')
    e.off('test1') // test off something that's already off
    e.emit('test1', 1)
    e.emit('test2', 2)
    expect(spy.calls.count()).toBe(1)
    expect(spy).toHaveBeenCalledWith(2, undefined, undefined, undefined)
  })

  it('off event + fn', function () {
    var spy2 = jasmine.createSpy('emitter')
    e.on('test', spy)
    e.on('test', spy2)
    e.off('test', spy)
    e.emit('test', 1, 2, 3)
    expect(spy.calls.count()).toBe(0)
    expect(spy2.calls.count()).toBe(1)
    expect(spy2).toHaveBeenCalledWith(1, 2, 3, undefined)
  })

  it('apply emit', function () {
    e.on('test', spy)
    e.applyEmit('test', 1)
    e.applyEmit('test', 1, 2, 3, 4, 5)
    expect(spy).toHaveBeenCalledWith(1)
    expect(spy).toHaveBeenCalledWith(1, 2, 3, 4, 5)
  })

  it('apply emit cancel', function () {
    expect(e._cancelled).toBe(false)
    e.on('test', function () {
      return false
    })
    e.applyEmit('test')
    expect(e._cancelled).toBe(true)
    e.applyEmit('other')
    expect(e._cancelled).toBe(false)
  })

})