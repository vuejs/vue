import config from '../config'
import {
  warn,
  nextTick
} from '../util/index'

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.

const queue = []
const userQueue = []
let has = {}
let circular = {}
let waiting = false

/**
 * Reset the batcher's state.
 */

function resetBatcherState () {
  queue.length = 0
  userQueue.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = false
}

/**
 * Flush both queues and run the watchers.
 */

function flushBatcherQueue () {
  runBatcherQueue(queue.sort(queueSorter))
  queue.length = 0
  runBatcherQueue(userQueue)
  // user watchers triggered more internal watchers
  if (queue.length) {
    runBatcherQueue(queue.sort(queueSorter))
  }
  resetBatcherState()
}

/**
 * Sort queue before flush.
 * This ensures components are updated from parent to child
 * so there will be no duplicate updates, e.g. a child was
 * pushed into the queue first and then its parent's props
 * changed.
 */

function queueSorter (a, b) {
  return a.id - b.id
}

/**
 * Run the watchers in a single queue.
 *
 * @param {Array} queue
 */

function runBatcherQueue (queue) {
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (let i = 0; i < queue.length; i++) {
    const watcher = queue[i]
    const id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > config._maxUpdateCount) {
        warn(
          'You may have an infinite update loop for watcher ' +
          'with expression "' + watcher.expression + '"',
          watcher.vm
        )
        break
      }
    }
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

export function pushWatcher (watcher) {
  const id = watcher.id
  if (has[id] == null) {
    // push watcher into appropriate queue
    const q = watcher.user
      ? userQueue
      : queue
    has[id] = q.length
    q.push(watcher)
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushBatcherQueue)
    }
  }
}
