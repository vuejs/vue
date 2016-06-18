/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

import { warn } from 'core/util/index'
import { isAndroid, isIE9 } from 'web/util/index'

const modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_\-]*)?$/

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', () => {
    const el = document.activeElement
    if (el && el.vmodel) {
      trigger(el, 'input')
    }
  })
}

export default {
  bind (el, binding, vnode) {
    if (process.env.NODE_ENV !== 'production') {
      if (!modelableTagRE.test(vnode.tag)) {
        warn(
          `v-model is not supported on element type: <${vnode.tag}>. ` +
          'If you are working with contenteditable, it\'s recommended to ' +
          'wrap a library dedicated for that purpose inside a custom component.',
          vnode.context
        )
      }
    }
    if (vnode.tag === 'select') {
      setSelected(el, binding.value)
    } else {
      if (!isAndroid) {
        el.addEventListener('compositionstart', onCompositionStart)
        el.addEventListener('compositionend', onCompositionEnd)
      }
      /* istanbul ignore if */
      if (isIE9) {
        el.vmodel = true
      }
    }
  },
  postupdate (el, binding, vnode) {
    const val = binding.value
    if (vnode.tag === 'select') {
      setSelected(el, val)
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matchig
      // option in the DOM.
      const needReset = el.multiple
        ? val.some(v => hasNoMatchingOption(v, el.options))
        : hasNoMatchingOption(val, el.options)
      if (needReset) {
        trigger(el, 'change')
      }
    }
  }
}

function setSelected (el, value) {
  const isMultiple = el.multiple
  if (!isMultiple) {
    el.selectedIndex = -1
  }
  for (let i = 0, l = el.options.length; i < l; i++) {
    const option = el.options[i]
    if (isMultiple) {
      option.selected = value.indexOf(getValue(option)) > -1
    } else {
      if (getValue(option) === value) {
        el.selectedIndex = i
        break
      }
    }
  }
}

function hasNoMatchingOption (value, options) {
  for (let i = 0, l = options.length; i < l; i++) {
    if (getValue(options[i]) === value) {
      return false
    }
  }
  return true
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value || option.text
}

function onCompositionStart (e) {
  e.target.composing = true
}

function onCompositionEnd (e) {
  e.target.composing = false
  trigger(e.target, 'input')
}

function trigger (el, type) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}
