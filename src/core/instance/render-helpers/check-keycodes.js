/* @flow */

import config from 'core/config'
import { hyphenate } from 'shared/util'

function isKeyNotMatch<T> (expect: T | Array<T>, actual: T): boolean {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
export function checkKeyCodes (
  eventKeyCode: number,
  key: string,
  builtInAlias?: number | Array<number>,
  eventKeyName?: string,
  builtInName?: string | Array<string>
): ?boolean {
  const keyCodes = config.keyCodes[key] || builtInAlias
  if (builtInName && keyCodes === builtInAlias && eventKeyName) {
    return isKeyNotMatch(builtInName, eventKeyName)
  } else if (keyCodes) {
    return isKeyNotMatch(keyCodes, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}
