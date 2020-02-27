/* @flow */
import { warn } from 'core/util/index'
/**
 * get BigInt function
 * if the browser support window.BigInt, we will use it
 * if not, we can customize BigInt() for vue
 */
export function getBigintFunc (): Function {
  if (typeof window !== 'undefined' && typeof window.BigInt === 'function') {
    return window.BigInt
  } else if (typeof global !== 'undefined' && typeof global.BigInt === 'function') {
    return global.BigInt
  } else {
    warn(
      'BigInt is not support！'
    )
    // customize our own BigInt() function
    return function (arg) {
      return arg
    }
  }
}
