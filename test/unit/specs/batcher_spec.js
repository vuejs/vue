var config = require('src/config')
var batcher = require('src/batcher')
var nextTick = require('src/util').nextTick

describe('Batcher', function () {
  var spy
  beforeEach(function () {
    spy = jasmine.createSpy('batcher')
  })

  it('pushWatcher', function (done) {
    batcher.pushWatcher({
      run: spy
    })
    nextTick(function () {
      expect(spy.calls.count()).toBe(1)
      done()
    })
  })

  it('dedup', function (done) {
    batcher.pushWatcher({
      id: 1,
      run: spy
    })
    batcher.pushWatcher({
      id: 1,
      run: spy
    })
    nextTick(function () {
      expect(spy.calls.count()).toBe(1)
      done()
    })
  })

  it('allow diplicate when flushing', function (done) {
    var job = {
      id: 1,
      run: spy
    }
    batcher.pushWatcher(job)
    batcher.pushWatcher({
      id: 2,
      run: function () {
        batcher.pushWatcher(job)
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
    batcher.pushWatcher({
      id: 2,
      user: true,
      run: function () {
        run.call(this)
        // user watcher triggering another directive update!
        batcher.pushWatcher({
          id: 3,
          run: run
        })
      }
    })
    batcher.pushWatcher({
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
        batcher.pushWatcher(job)
      }
    }
    batcher.pushWatcher(job)
    nextTick(function () {
      expect(count).toBe(config._maxUpdateCount + 1)
      expect('infinite update loop').toHaveBeenWarned()
      done()
    })
  })

  it('should call newly pushed watcher after current watcher is done', function (done) {
    var callOrder = []
    batcher.pushWatcher({
      id: 1,
      user: true,
      run: function () {
        callOrder.push(1)
        batcher.pushWatcher({
          id: 2,
          run: function () {
            callOrder.push(3)
          }
        })
        callOrder.push(2)
      }
    })
    nextTick(function () {
      expect(callOrder.join()).toBe('1,2,3')
      done()
    })
  })
})
