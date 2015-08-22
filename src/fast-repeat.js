var _ = require('./util')
var compiler = require('./compiler')
var templateParser = require('./parsers/template')

module.exports = {

  bind: function () {
    var inMatch = this.expression.match(/(.*) in (.*)/)
    if (inMatch) {
      this.arg = inMatch[1]
      this._watcherExp = inMatch[2]
    }

    this.start = _.createAnchor('fast-repeat-start')
    this.end = _.createAnchor('fast-repeat-end')
    _.replace(this.el, this.end)
    _.before(this.start, this.end)

    var vm = this.vm
    var template = _.isTemplate(this.el)
      ? templateParser.parse(this.el, true)
      : this.el
    var linker = compiler.compile(template, vm.$options, true)
    var parentScope = this._scope || this.vm
    var alias = this.arg
    var host = this._host
    this.create = function (data) {
      var el = templateParser.clone(template)
      var scope = Object.create(parentScope)
      Object.defineProperty(scope, alias, {
        enumberable: true,
        configurable: true,
        value: data
      })
      var unlink = linker(vm, el, host, scope)
      return new Fragment(el, unlink)
    }
  },

  update: function (list) {
    if (!list) debugger
    var anchor = this.end
    if (this.frags) {
      this.frags.forEach(function (f) {
        f.destroy()
      })
    }
    this.frags = list.map(this.create)
    this.frags.forEach(function (f) {
      f.before(anchor)
    })
  }
}

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
