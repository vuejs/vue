var _ = require('../util')

module.exports = {

  priority: 900,

  bind: function () {
    if (!this.arg) {
      // by default, components have _noSync:true
      // but when there's no arg it means we are
      // inheriting a parent object as $data, so we have
      // to sync the chagnes
      this.vm.$options._noSync = false
    }
    var self = this
    var path = this.arg || '$data'
    this.vm.$watch(path, function (val) {
      self.set(_.toNumber(val))
    })
  },

  update: function (value) {
    if (this.arg) {
      this.vm.$set(this.arg, value)
    } else if (this.vm.$data !== value) {
      this.vm.$data = value
    }
  }

}