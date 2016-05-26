/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

import { warn } from 'core/util/index'
import { isAndroid, isIE9 } from 'web/util/index'

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', () => {
    const el = document.activeElement
    if (el && el.vmodel) {
      trigger(el)
    }
  })
}

export default {
  bind (el, value, vnode) {
    if (process.env.NODE_ENV !== 'production') {
      const tag = el.tagName.toLowerCase()
      if (!tag.match(/input|select|textarea/)) {
        warn(
          `v-model is not supported on element type: <${tag}>. ` +
          'If you are working with contenteditable, it\'s recommended to ' +
          'wrap a library dedicated for that purpose inside a custom component.',
          vnode.context
        )
      }
    }
    if (!isAndroid) {
      el.addEventListener('compositionstart', onCompositionStart)
      el.addEventListener('compositionend', onCompositionEnd)
    }
    if (isIE9) {
      el.vmodel = true
    }
  },
  unbind (el) {
    if (!isAndroid) {
      el.removeEventListener('compositionstart', onCompositionStart)
      el.removeEventListener('compositionend', onCompositionEnd)
    }
  }
}

function onCompositionStart (e) {
  e.target.composing = true
}

function onCompositionEnd (e) {
  e.target.composing = false
  trigger(e.target)
}

function trigger (el) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent('input', true, true)
  el.dispatchEvent(e)
}
