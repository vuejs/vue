var _ = require('../util')
var keyFilter = require('../filters').key

// modifiers
var stopRE = /\.stop\b/
var preventRE = /\.prevent\b/

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
    // warn old usage
    if (process.env.NODE_ENV !== 'production') {
      if (this.filters) {
        var hasKeyFilter = this.filters.some(function (f) {
          return f.name === 'key'
        })
        if (hasKeyFilter) {
          _.deprecation.KEY_FILTER()
        }
      }
    }

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
      this.arg = event.slice(0, keyIndex)
      this.key = event.slice(keyIndex + 1)
    } else {
      this.arg = event
    }

    // deal with iframes
    if (
      this.el.tagName === 'IFRAME' &&
      this.arg !== 'load'
    ) {
      var self = this
      this.iframeBind = function () {
        _.on(self.el.contentWindow, self.arg, self.handler)
      }
      this.on('load', this.iframeBind)
    }
  },

  update: function (handler) {
    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Directive v-on="' + this.arg + ': ' +
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
      _.on(this.el, this.arg, this.handler)
    }
  },

  reset: function () {
    var el = this.iframeBind
      ? this.el.contentWindow
      : this.el
    if (this.handler) {
      _.off(el, this.arg, this.handler)
    }
  },

  unbind: function () {
    this.reset()
  }
}
