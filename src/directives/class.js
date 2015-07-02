var _ = require('../util')
var addClass = _.addClass
var removeClass = _.removeClass

module.exports = {

  update: function (value) {
    if (this.arg) {
      // single toggle
      var method = value ? addClass : removeClass
      method(this.el, this.arg)
    } else {
      this.cleanup()
      if (value && typeof value === 'string') {
        // raw class text
        addClass(this.el, value)
        this.lastVal = value
      } else if (_.isPlainObject(value)) {
        // object toggle
        for (var key in value) {
          if (value[key]) {
            addClass(this.el, key)
          } else {
            removeClass(this.el, key)
          }
        }
        this.prevKeys = Object.keys(value)
      }
    }
  },

  cleanup: function (value) {
    if (this.lastVal) {
      removeClass(this.el, this.lastVal)
    }
    if (this.prevKeys) {
      var i = this.prevKeys.length
      while (i--) {
        if (!value || !value[this.prevKeys[i]]) {
          removeClass(this.el, this.prevKeys[i])
        }
      }
    }
  }
}
