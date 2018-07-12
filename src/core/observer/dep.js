/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: {storage: ?Watcher};
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target.storage) {
      Dep.target.storage.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = {
  storage: null
}
const targetStack = []

export function pushTarget (_target: ?Watcher) {
  if (Dep.target.storage) targetStack.push(Dep.target.storage)
  Dep.target.storage = _target
}

export function popTarget () {
  Dep.target.storage = targetStack.pop()
}

export function depTarget (target: {storage: ?Watcher}): {storage: ?Watcher} | void {
  if (target) {
    Dep.target = target
  } else {
    return Dep.target
  }
}
