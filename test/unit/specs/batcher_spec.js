var _ = require('../../../src/util')
var batcher = require('../../../src/batcher')
var nextTick = require('../../../src/util').nextTick

describe('Batcher', function () {

  var spy

  beforeEach(function () {
    spy = jasmine.createSpy('batcher')
    spyOn(_, 'warn')
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

  it('calls user watchers after directive updates', function (done) {
    var vals = []
    function run () {
      vals.push(this.id)
    }
    batcher.push({
      id: 2,
      user: true,
      run: function () {
        run.call(this)
        // user watcher triggering another directive update!
        batcher.push({
          id: 3,
          run: run
        })
      }
    })
    batcher.push({
      id: 1,
      run: run
    })
    nextTick(function () {
      expect(vals[0]).toBe(1)
      expect(vals[1]).toBe(2)
      expect(vals[2]).toBe(3)
      done()
    })
  })

  it('warn against infinite update loops', function (done) {
    var count = 0
    var job = {
      id: 1,
      run: function () {
        count++
        batcher.push(job)
      }
    }
    batcher.push(job)
    nextTick(function () {
      expect(count).not.toBe(0)
      expect(_.warn).toHaveBeenCalled()
      done()
    })
  })

})