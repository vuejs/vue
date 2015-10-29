var _ = require('../../util')
var addClass = _.addClass
var removeClass = _.removeClass

module.exports = {

  deep: true,

  update: function (value) {
    if (value && typeof value === 'string') {
      this.handleObject(stringToObject(value))
    } else if (_.isPlainObject(value)) {
      this.handleObject(value)
    } else if (_.isArray(value)) {
      this.handleArray(value)
    } else {
      this.cleanup()
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

  handleArray: function (value) {
    this.cleanup(value)
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        addClass(this.el, value[i])
      }
    }
    this.prevKeys = value.slice()
  },

  cleanup: function (value) {
    if (this.prevKeys) {
      var i = this.prevKeys.length
      while (i--) {
        var key = this.prevKeys[i]
        if (key && (!value || !contains(value, key))) {
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

function contains (value, key) {
  return _.isArray(value)
    ? value.indexOf(key) > -1
    : value.hasOwnProperty(key)
}
