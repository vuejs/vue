var _ = require('../util')

module.exports = {

  isLiteral: true,
  priority: 1500,

  bind: function () {
    var scope = this._scope || this.vm
    var refs = scope.$$
    var id = this.id = this.arg // bind-el ?
      ? scope.$eval(this.expression)
      : this.expression
    if (refs.hasOwnProperty(id)) {
      refs[id] = this.el
    } else {
      _.defineReactive(refs, id, this.el)
    }
  },

  unbind: function () {
    (this._scope || this.vm).$$[this.id] = null
  }
}
