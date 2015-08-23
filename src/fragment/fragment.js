var _ = require('../util')

function Fragment (el, unlink) {
  this.start = _.createAnchor('fragment')
  this.end = _.createAnchor('fragment')
  this.frag = el
  this.unlink = unlink
}

Fragment.prototype.before = function (target) {
  _.before(this.start, target)
  _.before(this.frag, target)
  _.before(this.end, target)
}

Fragment.prototype.remove = function () {
  var parent = this.start.parentNode
  var node = this.start.nextSibling
  while (node !== this.end) {
    this.frag.appendChild(node)
  }
  parent.removeChild(this.start)
  parent.removeChild(this.end)
}

Fragment.prototype.destroy = function () {
  this.remove()
  this.unlink()
}

module.exports = Fragment
