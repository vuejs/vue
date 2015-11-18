import { nextTick } from '../util/index'

let queue = []
let queued = false

/**
 * Push a job into the queue.
 *
 * @param {Function} job
 */

export function pushJob (job) {
  queue.push(job)
  if (!queued) {
    queued = true
    nextTick(flush)
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush () {
  // Force layout
  var f = document.documentElement.offsetHeight
  for (var i = 0; i < queue.length; i++) {
    queue[i]()
  }
  queue = []
  queued = false
  // dummy return, so js linters don't complain about
  // unused variable f
  return f
}
