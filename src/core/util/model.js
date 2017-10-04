/* @flow */

import { warn } from './debug'
import { parseModel } from 'compiler/directives/model'

export function checkKeyExistence (vm: Component, expression: string) {
  const res = parseModel(expression)
  // last key segment is dynamic and will be set with `$set`
  if (res.key) return
  const path = res.exp.split('.')
  // root path is already checked against
  if (path.length === 1) return
  let val = vm
  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    if (!(key in val)) {
      warn(
        `v-model="${expression}" is bound to a property that does not exist ` +
        `and will not be reactive. Declare the property in data to ensure ` +
        `reactivity.`,
        vm
      )
      break
    } else {
      val = val[key]
    }
  }
}
