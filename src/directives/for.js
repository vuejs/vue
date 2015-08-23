var _ = require('../util')
var FragmentFactory = require('../fragment/factory')

module.exports = {

  bind: function () {
    var inMatch = this.expression.match(/(.*) in (.*)/)
    if (inMatch) {
      this.arg = inMatch[1]
      this._watcherExp = inMatch[2]
    }
    this.start = _.createAnchor('v-for-start')
    this.end = _.createAnchor('v-for-end')
    _.replace(this.el, this.end)
    _.before(this.start, this.end)
    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el)
  },

  create: function (data, index, key) {
    var host = this._host
    // create iteration scope
    var parentScope = this._scope || this.vm
    var scope = Object.create(parentScope)
    // define scope properties
    _.defineReactive(scope, this.arg, data)
    _.defineReactive(scope, '$index', index)
    if (key) {
      _.defineReactive(scope, '$key', key)
    }
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
    this.frags = list.map(function (data, i) {
      return self.create(data, i)
    })
    this.frags.forEach(function (f) {
      f.before(anchor)
    })
  }
}
