/* global jQuery */

import {
  isIE9,
  isAndroid,
  toNumber,
  _toString,
  nextTick,
  debounce as _debounce
} from '../../../util/index'

export default {

  bind () {
    var self = this
    var el = this.el
    var isRange = el.type === 'range'
    var lazy = this.params.lazy
    var number = this.params.number
    var debounce = this.params.debounce

    // handle composition events.
    //   http://blog.evanyou.me/2014/01/03/composition-event/
    // skip this for Android because it handles composition
    // events quite differently. Android doesn't trigger
    // composition events for language input methods e.g.
    // Chinese, but instead triggers them for spelling
    // suggestions... (see Discussion/#162)
    var composing = false
    if (!isAndroid && !isRange) {
      this.on('compositionstart', function () {
        composing = true
      })
      this.on('compositionend', function () {
        composing = false
        // in IE11 the "compositionend" event fires AFTER
        // the "input" event, so the input handler is blocked
        // at the end... have to call it here.
        //
        // #1327: in lazy mode this is unecessary.
        if (!lazy) {
          self.listener()
        }
      })
    }

    // prevent messing with the input when user is typing,
    // and force update on blur.
    this.focused = false
    if (!isRange && !lazy) {
      this.on('focus', function () {
        self.focused = true
      })
      this.on('blur', function () {
        self.focused = false
      })
    }

    // Now attach the main listener
    this.listener = this.rawListener = function () {
      if (composing || !self._bound) {
        return
      }
      var val = number || isRange
        ? toNumber(el.value)
        : el.value
      self.set(val)
      // force update on next tick to avoid lock & same value
      // also only update when user is not typing
      nextTick(function () {
        if (self._bound && !self.focused) {
          self.update(self._watcher.value)
        }
      })
    }

    // apply debounce
    if (debounce) {
      this.listener = _debounce(this.listener, debounce)
    }

    // Support jQuery events, since jQuery.trigger() doesn't
    // trigger native events in some cases and some plugins
    // rely on $.trigger()
    //
    // We want to make sure if a listener is attached using
    // jQuery, it is also removed with jQuery, that's why
    // we do the check for each directive instance and
    // store that check result on itself. This also allows
    // easier test coverage control by unsetting the global
    // jQuery variable in tests.
    this.hasjQuery = typeof jQuery === 'function'
    if (this.hasjQuery) {
      const method = jQuery.fn.on ? 'on' : 'bind'
      jQuery(el)[method]('change', this.rawListener)
      if (!lazy) {
        jQuery(el)[method]('input', this.listener)
      }
    } else {
      this.on('change', this.rawListener)
      if (!lazy) {
        this.on('input', this.listener)
      }
    }

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && isIE9) {
      this.on('cut', function () {
        nextTick(self.listener)
      })
      this.on('keyup', function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener()
        }
      })
    }

    // set initial value if present
    if (
      el.hasAttribute('value') ||
      (el.tagName === 'TEXTAREA' && el.value.trim())
    ) {
      this.afterBind = this.listener
    }
  },

  update (value) {
    this.el.value = _toString(value)
  },

  unbind () {
    var el = this.el
    if (this.hasjQuery) {
      const method = jQuery.fn.off ? 'off' : 'unbind'
      jQuery(el)[method]('change', this.listener)
      jQuery(el)[method]('input', this.listener)
    }
  }
}
