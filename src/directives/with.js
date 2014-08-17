module.exports = {

  priority: 900,

  bind: function () {
    var self = this
    var path = this.arg || '$data'
    this.vm.$watch(path, function (val) {
      self.set(val)
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