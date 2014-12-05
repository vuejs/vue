var _ = require('./util')

/**
 * The Batcher maintains a job queue to be run
 * async on the next event loop. A "job" can be any object
 * that implements the following interface:
 * 
 *   {
 *     id: {Number} - optional
 *     run: {Function}
 *     user: {Boolean} - optional
 *   }
 *
 * The `id` property is used to prevent duplication of jobs,
 * while jobs with `user:true` need to be processed after
 * all internal jobs have been processed first.
 *
 * In most cases a job will actually be a Watcher instance
 * which implements the above interface.
 */

function Batcher () {
  this.reset()
}

var p = Batcher.prototype

/**
 * Reset the batcher's state.
 */

p.reset = function () {
  this.has = {}
  // we have two separate queues: one for directive updates
  // and one for user watcher registered via $watch().
  // we want to guarantee directive updates to be called
  // before user watchers so that when user watchers are
  // triggered, the DOM would have already been in updated
  // state.
  this.queue = []
  this.userQueue = []
  this.waiting = false
  this.flushing = false
}

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
    // A user watcher callback could trigger another
    // directive update during the flushing; at that time
    // the directive queue would already have been run, so
    // we call that update immediately as it is pushed.
    if (this.flushing && !job.user) {
      job.run()
      return
    }
    var queue = job.user
      ? this.userQueue
      : this.queue
    queue.push(job)
    this.has[job.id] = job
    if (!this.waiting) {
      this.waiting = true
      _.nextTick(this.flush, this)
    }
  }
}

/**
 * Flush both queues and run the jobs.
 */

p.flush = function () {
  this.flushing = true
  run(this.queue)
  run(this.userQueue)
  this.reset()
}

/**
 * Run the jobs in a single queue.
 *
 * @param {Array} queue
 */

function run (queue) {
  // do not cache length because more jobs might be pushed
  // as we run existing jobs
  for (var i = 0; i < queue.length; i++) {
    queue[i].run()
  }
}

module.exports = Batcher