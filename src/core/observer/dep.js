/* @flow */

import type Watcher from './watcher'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;

  // the order for accessing the watcher should be O(1)
  // so that we avoid perf bottleneck when we teardown
  // a watcher depends on a large size array.
  subs: { [key: string]: Watcher };

  constructor () {
    this.id = uid++
    this.subs = {}
  }

  addSub (sub: Watcher) {
    this.subs[String(sub.id)] = sub
  }

  removeSub (sub: Watcher) {
    delete this.subs[String(sub.id)]
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = Object.keys(this.subs).map(id => this.subs[id])
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null
const targetStack = []

export function pushTarget (_target: ?Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

export function popTarget () {
  Dep.target = targetStack.pop()
}
