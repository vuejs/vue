/* @flow */

import type Watcher from './watcher'
import { isNative, remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
declare interface Dep {
  id: number;
  constructor(): void;
  addSub (sub: Watcher): void;
  removeSub (sub: Watcher): void;
  depend (): void;
  notify (): void;
}

let DepImpl

if (typeof Set !== 'undefined' && isNative(Set)) {
  class SetDep implements Dep {
    static target: ?Watcher
    id: number
    subs: Set

    constructor () {
      this.id = uid++
      this.subs = new Set()
    }

    addSub (sub: Watcher) {
      this.subs.add(sub)
    }

    removeSub (sub: Watcher) {
      this.subs.delete(sub)
    }

    depend () {
      if (SetDep.target) {
        SetDep.target.addDep(this)
      }
    }

    notify () {
      // stabilize the subscriber list first
      let subs = Array.from(this.subs)
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
  DepImpl = SetDep
} else {
  class ArrayDep implements Dep {
    static target: ?Watcher
    id: number
    subs: Array<Watcher>

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
      if (ArrayDep.target) {
        ArrayDep.target.addDep(this)
      }
    }

    notify () {
      // stabilize the subscriber list first
      const subs = this.subs.slice()
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
  DepImpl = ArrayDep
}

export default (DepImpl: Class<Dep>)

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
DepImpl.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  DepImpl.target = target
}

export function popTarget () {
  targetStack.pop()
  DepImpl.target = targetStack[targetStack.length - 1]
}
