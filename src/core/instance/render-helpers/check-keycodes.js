/* @flow */

import config from 'core/config'
import { hyphenate } from 'shared/util'

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
  if (builtInAlias && keyCodes === builtInAlias && eventKeyName) {
    if (Array.isArray(builtInName)) {
      return builtInName.indexOf(eventKeyName) === -1
    } else {
      return builtInName !== eventKeyName
    }
  } else if (keyCodes) {
    if (Array.isArray(keyCodes)) {
      return keyCodes.indexOf(eventKeyCode) === -1
    } else {
      return keyCodes !== eventKeyCode
    }
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}
