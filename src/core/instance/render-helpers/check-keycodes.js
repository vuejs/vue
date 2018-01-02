/* @flow */

import config from 'core/config'
import { hyphenate } from 'shared/util'

const keyNames: { [key: string]: string | Array<string> } = {
  esc: 'Escape',
  tab: 'Tab',
  enter: 'Enter',
  space: ' ',
  up: 'ArrowUp',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  down: 'ArrowDown',
  'delete': ['Backspace', 'Delete']
}

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
  eventKeyName?: string
): ?boolean {
  const keyCodes = config.keyCodes[key] || builtInAlias
  const builtInName: string | Array<string> = keyNames[key]
  if (builtInName && keyCodes === builtInAlias && eventKeyName) {
    return isKeyNotMatch(builtInName, eventKeyName)
  } else if (keyCodes) {
    return isKeyNotMatch(keyCodes, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}
