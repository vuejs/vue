/* @flow */

import type Watcher from './watcher'
import config from '../config'
import {
  warn,
  nextTick,
  devtools
} from '../util/index'

// We have two separate queues: one for internal component re-render updates
// and one for user watcher registered via $watch(). We want to guarantee
// re-render updates to be called before user watchers so that when user
// watchers are triggered, the DOM would already be in updated state.

const queue: Array<Watcher> = []
const userQueue: Array<Watcher> = []
let has: { [key: number]: ?true } = {}
let circular: { [key: number]: number } = {}
let waiting = false

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
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
function flushSchedulerQueue () {
  runSchedulerQueue(queue.sort(queueSorter))
  runSchedulerQueue(userQueue)
  // user watchers triggered more watchers,
  // keep flushing until it depletes
  if (queue.length) {
    return flushSchedulerQueue()
  }
  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
  resetSchedulerState()
}

/**
 * Sort queue before flush.
 * This ensures components are updated from parent to child
 * so there will be no duplicate updates, e.g. a child was
 * pushed into the queue first and then its parent's props
 * changed.
 */
function queueSorter (a: Watcher, b: Watcher) {
  return a.id - b.id
}

/**
 * Run the watchers in a single queue.
 */
function runSchedulerQueue (queue: Array<Watcher>) {
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
  queue.length = 0
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    // push watcher into appropriate queue
    const q = watcher.user
      ? userQueue
      : queue
    has[id] = true
    q.push(watcher)
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}
