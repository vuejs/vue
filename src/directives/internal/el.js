var _ = require('../../util')

module.exports = {

  priority: 1500,

  update: function (id) {
    if (this.id) {
      this.unbind()
    }
    this.id = id
    var refs = (this._scope || this.vm).$$
    if (refs.hasOwnProperty(id)) {
      refs[id] = this.el
    } else {
      _.defineReactive(refs, id, this.el)
    }
  },

  unbind: function () {
    var refs = (this._scope || this.vm).$$
    if (refs[this.id] === this.el) {
      refs[this.id] = null
    }
  }
}
