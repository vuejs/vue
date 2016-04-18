import { isAndroid, isIE9 } from '../util/env'

export default {
  bind (el, value) {
    if (!isAndroid) {
      el.addEventListener('compositionstart', onCompositionStart)
      el.addEventListener('compositionend', onCompositionEnd)
    }
    if (isIE9) {
      el.addEventListener('cut', trigger)
      el.addEventListener('keyup', triggerOnDelOrBackspace)
    }
  },
  unbind (el) {
    if (!isAndroid) {
      el.removeEventListener('compositionstart', onCompositionStart)
      el.removeEventListener('compositionend', onCompositionEnd)
    }
    if (isIE9) {
      el.removeEventListener('cut', trigger)
      el.removeEventListener('keyup', triggerOnDelOrBackspace)
    }
  }
}

function onCompositionStart (e) {
  e.target.composing = true
}

function onCompositionEnd (e) {
  e.target.composing = false
  trigger(e)
}

function trigger (e) {
  const ev = document.createEvent('HTMLEvents')
  ev.initEvent('input', true, true)
  e.target.dispatchEvent(ev)
}

function triggerOnDelOrBackspace (e) {
  if (e.keyCode === 46 || e.keyCode === 8) {
    trigger(e)
  }
}
