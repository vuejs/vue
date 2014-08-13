var _ = require('../util')

exports.bind = function () {
  this.attr = this.el.nodeType === 3
    ? 'nodeValue'
    : 'textContent'
}

exports.update = function (value) {
  this.el[this.attr] = _.guard(value)
}