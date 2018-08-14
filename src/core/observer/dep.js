/* @flow */

import type Watcher from './watcher'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: {[key: string | number]: Watcher};

  constructor () {
    this.id = uid++
    this.subs = {}
  }

  addSub (sub: Watcher) {
    this.subs[sub.id] = sub
  }

  removeSub (sub: Watcher) {
    delete this.subs[sub.id]
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    const subs = Object.keys(this.subs).map(key => this.subs[key])
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
