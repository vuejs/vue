var _ = require('../util')
var addClass = _.addClass
var removeClass = _.removeClass

module.exports = {

  bind: function () {
    // interpolations like class="{{abc}}" are converted
    // to v-class, and we need to remove the raw,
    // uninterpolated className at binding time.
    var raw = this._descriptor._rawClass
    if (raw) {
      this.prevKeys = raw.trim().split(/\s+/)
    }
  },

  update: function (value) {
    if (this.arg) {
      // single toggle
      if (value) {
        addClass(this.el, this.arg)
      } else {
        removeClass(this.el, this.arg)
      }
    } else {
      if (value && typeof value === 'string') {
        this.handleObject(stringToObject(value))
      } else if (_.isPlainObject(value)) {
        this.handleObject(value)
      } else {
        this.cleanup()
      }
    }
  },

  handleObject: function (value) {
    this.cleanup(value)
    var keys = this.prevKeys = Object.keys(value)
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      if (value[key]) {
        addClass(this.el, key)
      } else {
        removeClass(this.el, key)
      }
    }
  },

  cleanup: function (value) {
    if (this.prevKeys) {
      var i = this.prevKeys.length
      while (i--) {
        var key = this.prevKeys[i]
        if (!value || !value.hasOwnProperty(key)) {
          removeClass(this.el, key)
        }
      }
    }
  }
}

function stringToObject (value) {
  var res = {}
  var keys = value.trim().split(/\s+/)
  var i = keys.length
  while (i--) {
    res[keys[i]] = true
  }
  return res
}
