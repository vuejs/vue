var _ = require('./util')

/**
 * The Batcher maintains a job queue to be run
 * async on the next event loop.
 */

function Batcher () {
  this.reset()
}

var p = Batcher.prototype

/**
 * Push a job into the job queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Object} job
 *   properties:
 *   - {String|Number} id
 *   - {Function}      run
 */

p.push = function (job) {
  if (!job.id || !this.has[job.id] || this.flushing) {
    this.queue.push(job)
    this.has[job.id] = job
    if (!this.waiting) {
      this.waiting = true
      _.nextTick(this.flush, this)
    }
  }
}

/**
 * Flush the queue and run the jobs.
 * Will call a preFlush hook if has one.
 */

p.flush = function () {
  this.flushing = true
  // do not cache length because more jobs might be pushed
  // as we run existing jobs
  for (var i = 0; i < this.queue.length; i++) {
    var job = this.queue[i]
    if (!job.cancelled) {
      job.run()
    }
  }
  this.reset()
}

/**
 * Reset the batcher's state.
 */

p.reset = function () {
  this.has = {}
  this.queue = []
  this.waiting = false
  this.flushing = false
}

module.exports = Batcher