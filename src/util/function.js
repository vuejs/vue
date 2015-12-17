import { hasNewFunction, inBrowser } from './index'

let nativeFunction
if (inBrowser) {
  nativeFunction = window.Function
} else {
  nativeFunction = global.Function
}

// Allow to create new functions from strings
// even when native `new Function()` is forbidden
let exportedFunction = nativeFunction
if (!hasNewFunction) {
  exportedFunction = require('loophole').Function
}

export const Function = exportedFunction
