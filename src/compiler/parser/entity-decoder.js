/* @flow */

import { inBrowser } from 'core/util/env'

let decode

/* istanbul ignore else */
if (inBrowser) {
  const decoder = document.createElement('div')
  decode = (html: string): string => {
    decoder.innerHTML = html
    return decoder.textContent
  }
} else {
  decode = require('he').decode
}

export { decode }
