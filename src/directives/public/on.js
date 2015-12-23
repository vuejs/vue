import { on, off, warn } from '../../util/index'
import { ON } from '../priorities'

// keyCode aliases
const keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  'delete': 46,
  up: 38,
  left: 37,
  right: 39,
  down: 40
}

function keyFilter (handler, keys) {
  var codes = keys.map(function (key) {
    var charCode = key.charCodeAt(0)
    if (charCode > 47 && charCode < 58) {
      return parseInt(key, 10)
    }
    if (key.length === 1) {
      charCode = key.toUpperCase().charCodeAt(0)
      if (charCode > 64 && charCode < 91) {
        return charCode
      }
    }
    return keyCodes[key]
  })
  return function keyHandler (e) {
    if (codes.indexOf(e.keyCode) > -1) {
      return handler.call(this, e)
    }
  }
}

function stopFilter (handler) {
  return function stopHandler (e) {
    e.stopPropagation()
    return handler.call(this, e)
  }
}

function preventFilter (handler) {
  return function preventHandler (e) {
    e.preventDefault()
    return handler.call(this, e)
  }
}

export default {

  acceptStatement: true,
  priority: ON,

  bind () {
    // deal with iframes
    if (
      this.el.tagName === 'IFRAME' &&
      this.arg !== 'load'
    ) {
      var self = this
      this.iframeBind = function () {
        on(self.el.contentWindow, self.arg, self.handler)
      }
      this.on('load', this.iframeBind)
    }
  },

  update (handler) {
    // stub a noop for v-on with no value,
    // e.g. @mousedown.prevent
    if (!this.descriptor.raw) {
      handler = function () {}
    }

    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'v-on:' + this.arg + '="' +
        this.expression + '" expects a function value, ' +
        'got ' + handler
      )
      return
    }

    // apply modifiers
    if (this.modifiers.stop) {
      handler = stopFilter(handler)
    }
    if (this.modifiers.prevent) {
      handler = preventFilter(handler)
    }
    // key filter
    var keys = Object.keys(this.modifiers)
      .filter(function (key) {
        return key !== 'stop' && key !== 'prevent'
      })
    if (keys.length) {
      handler = keyFilter(handler, keys)
    }

    this.reset()
    this.handler = handler

    if (this.iframeBind) {
      this.iframeBind()
    } else {
      on(this.el, this.arg, this.handler)
    }
  },

  reset () {
    var el = this.iframeBind
      ? this.el.contentWindow
      : this.el
    if (this.handler) {
      off(el, this.arg, this.handler)
    }
  },

  unbind () {
    this.reset()
  }
}
