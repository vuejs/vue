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

    this.create = _.bind(function (data) {
      var el = templateParser.clone(template)
      var scope = Object.create(this._scope || this.vm)
      Object.defineProperty(scope, this.arg, {
        enumberable: true,
        configurable: true,
        value: data
      })
      var unlink = linker(vm, el, this._host, scope)
      var f = {
        el: el,
        unlink: unlink
      }
      return f
    }, this)
  },

  update: function (list) {
    if (!list) debugger
    var anchor = this.end
    this.frags = list.map(this.create)
    this.frags.forEach(function (f) {
      _.before(f.el, anchor)
    })
  }
}
