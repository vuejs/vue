var _ = require('./util')
var FragmentFactory = require('./fragment/factory')

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
    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el)
  },

  create: function (data) {
    var host = this._host
    var parentScope = this._scope || this.vm
    var scope = Object.create(parentScope)
    var alias = this.arg
    Object.defineProperty(scope, alias, {
      enumberable: true,
      configurable: true,
      value: data
    })
    return this.factory.create(host, scope)
  },

  update: function (list) {
    var self = this
    var anchor = this.end
    if (this.frags) {
      this.frags.forEach(function (f) {
        f.destroy()
      })
    }
    this.frags = list.map(function (data) {
      return self.create(data)
    })
    this.frags.forEach(function (f) {
      f.before(anchor)
    })
  }
}
