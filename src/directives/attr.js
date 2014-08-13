var _ = require('../util')

exports.bind = function () {
  var params = this.vm.$options.paramAttributes
  this.isParam =
    this.el.__vue__ && // only check rootNode for params
    params &&
    params.indexOf(this.arg) > -1
}

exports.update = function (value) {
  if (value || value === 0) {
    this.el.setAttribute(this.arg, value)
  } else {
    this.el.removeAttribute(this.arg)
  }
  if (this.isParam) {
    this.vm[this.arg] = _.guardNumber(value)
  }
}