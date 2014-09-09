var Batcher = require('../../../src/batcher')
var nextTick = require('../../../src/util').nextTick

describe('Batcher', function () {

  var batcher = new Batcher()
  var spy

  beforeEach(function () {
    spy = jasmine.createSpy('batcher')
  })
  
  it('push', function (done) {
    batcher.push({
      run: spy
    })
    nextTick(function () {
      expect(spy.calls.count()).toBe(1)
      done()
    })
  })

  it('dedup', function (done) {
    batcher.push({
      id: 1,
      run: spy
    })
    batcher.push({
      id: 1,
      run: spy
    })
    nextTick(function () {
      expect(spy.calls.count()).toBe(1)
      done()
    })
  })

  it('override', function (done) {
    var spy2 = jasmine.createSpy('batcher')
    batcher.push({
      id: 1,
      run: spy
    })
    batcher.push({
      id: 1,
      run: spy2,
      override: true
    })
    nextTick(function () {
      expect(spy).not.toHaveBeenCalled()
      expect(spy2.calls.count()).toBe(1)
      done()
    })
  })

})