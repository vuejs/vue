var _ = require('../../util')

module.exports = {

  priority: 1500,

  bind: function () {
    /* istanbul ignore if */
    if (!this.arg) {
      return
    }
    var id = this.id = _.camelize(this.arg)
    var refs = (this._scope || this.vm).$els
    if (refs.hasOwnProperty(id)) {
      refs[id] = this.el
    } else {
      _.defineReactive(refs, id, this.el)
    }
  },

  unbind: function () {
    var refs = (this._scope || this.vm).$els
    if (refs[this.id] === this.el) {
      refs[this.id] = null
    }
  }
}
