var _ = require('../../util')

// modifiers
var stopRE = /\.stop\b/
var preventRE = /\.prevent\b/

// keyCode aliases
var keyCodes = {
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

function keyFilter (handler, key) {
  var code = keyCodes[key]
  if (!code) {
    code = parseInt(key, 10)
  }
  return function (e) {
    if (e.keyCode === code) {
      return handler.call(this, e)
    }
  }
}

function stopFilter (handler) {
  return function (e) {
    e.stopPropagation()
    return handler.call(this, e)
  }
}

function preventFilter (handler) {
  return function (e) {
    e.preventDefault()
    return handler.call(this, e)
  }
}

module.exports = {

  acceptStatement: true,
  priority: 700,

  bind: function () {
    // 1.0.0 key filter
    var event = this.arg

    // stop modifier
    if (stopRE.test(event)) {
      this.stop = true
      event = event.replace(stopRE, '')
    }

    // prevent modifier
    if (preventRE.test(event)) {
      this.prevent = true
      event = event.replace(preventRE, '')
    }

    // key modifier
    var keyIndex = event.indexOf('.')
    if (keyIndex > -1) {
      this.event = event.slice(0, keyIndex)
      this.key = event.slice(keyIndex + 1)
    } else {
      this.event = event
    }

    // deal with iframes
    if (
      this.el.tagName === 'IFRAME' &&
      this.event !== 'load'
    ) {
      var self = this
      this.iframeBind = function () {
        _.on(self.el.contentWindow, self.event, self.handler)
      }
      this.on('load', this.iframeBind)
    }
  },

  update: function (handler) {
    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && _.warn(
        'v-on:' + this.event + '="' +
        this.expression + '" expects a function value, ' +
        'got ' + handler
      )
      return
    }

    // apply modifiers
    if (this.stop) {
      handler = stopFilter(handler)
    }
    if (this.prevent) {
      handler = preventFilter(handler)
    }
    if (this.key) {
      handler = keyFilter(handler, this.key)
    }

    this.reset()
    var scope = this._scope || this.vm
    this.handler = function (e) {
      scope.$event = e
      var res = handler(e)
      scope.$event = null
      return res
    }
    if (this.iframeBind) {
      this.iframeBind()
    } else {
      _.on(this.el, this.event, this.handler)
    }
  },

  reset: function () {
    var el = this.iframeBind
      ? this.el.contentWindow
      : this.el
    if (this.handler) {
      _.off(el, this.event, this.handler)
    }
  },

  unbind: function () {
    this.reset()
  }
}
