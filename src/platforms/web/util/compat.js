/* @flow */

import { inBrowser } from 'core/util/index'

// check whether current browser encodes a char inside attribute values
function shouldDecode (content: string, encoded: string): boolean {
  const div = document.createElement('div')
  div.innerHTML = `<div a="${content}">`
  return div.innerHTML.indexOf(encoded) > 0
}

// According to
// https://w3c.github.io/DOM-Parsing/#dfn-serializing-an-attribute-value
// when serializing innerHTML, <, >, ", & should be encoded as entities.
// However, only some browsers, e.g. PhantomJS, encodes < and >.
// this causes problems with the in-browser parser.
export const shouldDecodeTags = inBrowser ? shouldDecode('>', '&gt;') : false

// #3663
// IE encodes newlines inside attribute values while other browsers don't
export const shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false
