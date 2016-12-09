/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

import { looseEqual, looseIndexOf } from 'shared/util'
import { warn, isAndroid, isIE9, isIE, isEdge } from 'core/util/index'

const modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_-]*)?$/

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
  inserted (el, binding, vnode) {
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
      const cb = () => {
        setSelected(el, binding, vnode.context)
      }
      cb()
      /* istanbul ignore if */
      if (isIE || isEdge) {
        setTimeout(cb, 0)
      }
    } else if (vnode.tag === 'textarea' || el.type === 'text') {
      el._vModifiers = binding.modifiers
      if (!binding.modifiers.lazy) {
        if (!isAndroid) {
          el.addEventListener('compositionstart', onCompositionStart)
          el.addEventListener('compositionend', onCompositionEnd)
        }
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true
        }
      }
    }
  },
  componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      const needReset = el.multiple
        ? binding.value.some(v => hasNoMatchingOption(v, el.options))
        : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, el.options)
      if (needReset) {
        trigger(el, 'change')
      }
    }
  }
}

function setSelected (el, binding, vm) {
  const value = binding.value
  const isMultiple = el.multiple
  if (isMultiple && !Array.isArray(value)) {
    process.env.NODE_ENV !== 'production' && warn(
      `<select multiple v-model="${binding.expression}"> ` +
      `expects an Array value for its binding, but got ${
        Object.prototype.toString.call(value).slice(8, -1)
      }`,
      vm
    )
    return
  }
  let selected, option
  for (let i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i]
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1
      if (option.selected !== selected) {
        option.selected = selected
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1
  }
}

function hasNoMatchingOption (value, options) {
  for (let i = 0, l = options.length; i < l; i++) {
    if (looseEqual(getValue(options[i]), value)) {
      return false
    }
  }
  return true
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
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
