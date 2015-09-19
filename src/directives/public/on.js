var _ = require('../../util')

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

/**
 * Wrap a handler function so that it only gets triggered on
 * specified keypress events.
 *
 * @param {Function} handler
 * @param {String|Number} key
 * @return {Function}
 */

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

module.exports = {

  acceptStatement: true,
  priority: 700,

  bind: function () {
    // 1.0.0 key filter
    var rawEvent = this.event = this.arg
    var keyIndex = rawEvent.indexOf('.')
    if (keyIndex > -1) {
      this.event = rawEvent.slice(0, keyIndex)
      this.key = rawEvent.slice(keyIndex + 1)
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
        'on-"' + this.event + '="' +
        this.expression + '" expects a function value, ' +
        'got ' + handler
      )
      return
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
