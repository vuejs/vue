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

  it('allow diplicate when flushing', function (done) {
    batcher.push({
      id: 1,
      run: function () {
        spy()
        batcher.push({
          id: 1,
          run: spy
        })
      }
    })
    nextTick(function () {
      expect(spy.calls.count()).toBe(2)
      done()
    })
  })

})