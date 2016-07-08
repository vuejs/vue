import config from 'core/config'
import { queueWatcher } from 'core/observer/scheduler'

describe('Scheduler', () => {
  let spy
  beforeEach(() => {
    spy = jasmine.createSpy('scheduler')
  })

  it('queueWatcher', done => {
    queueWatcher({
      run: spy
    })
    waitForUpdate(() => {
      expect(spy.calls.count()).toBe(1)
    }).then(done)
  })

  it('dedup', done => {
    queueWatcher({
      id: 1,
      run: spy
    })
    queueWatcher({
      id: 1,
      run: spy
    })
    waitForUpdate(() => {
      expect(spy.calls.count()).toBe(1)
    }).then(done)
  })

  it('allow duplicate when flushing', done => {
    const job = {
      id: 1,
      run: spy
    }
    queueWatcher(job)
    queueWatcher({
      id: 2,
      run () { queueWatcher(job) }
    })
    waitForUpdate(() => {
      expect(spy.calls.count()).toBe(2)
    }).then(done)
  })

  it('calls user watchers after directive updates', done => {
    const vals = []
    function run () {
      vals.push(this.id)
    }
    queueWatcher({
      id: 2,
      user: true,
      run () {
        run.call(this)
        // user watcher triggering another directive update!
        queueWatcher({
          id: 3,
          run: run
        })
      }
    })
    queueWatcher({
      id: 1,
      run: run
    })
    waitForUpdate(() => {
      expect(vals[0]).toBe(1)
      expect(vals[1]).toBe(2)
      expect(vals[2]).toBe(3)
    }).then(done)
  })

  it('warn against infinite update loops', function (done) {
    let count = 0
    const job = {
      id: 1,
      run () {
        count++
        queueWatcher(job)
      }
    }
    queueWatcher(job)
    waitForUpdate(() => {
      expect(count).toBe(config._maxUpdateCount + 1)
      expect('infinite update loop').toHaveBeenWarned()
    }).then(done)
  })

  it('should call newly pushed watcher after current watcher is done', done => {
    const callOrder = []
    queueWatcher({
      id: 1,
      user: true,
      run () {
        callOrder.push(1)
        queueWatcher({
          id: 2,
          run () {
            callOrder.push(3)
          }
        })
        callOrder.push(2)
      }
    })
    waitForUpdate(() => {
      expect(callOrder.join()).toBe('1,2,3')
    }).then(done)
  })
})
