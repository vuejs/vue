import { isAndroid, isIE9 } from '../util/env'

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
  bind (el) {
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
