module.exports = {

  bind: function () {
    if (this.arg) {
      var self = this
      this.vm.$watch(this.arg, function (val) {
        self.set(val)
      })
    }
  },

  update: function (value) {
    if (this.arg) {
      this.vm.$set(this.arg, value)
    } else if (this.vm.$data !== value) {
      this.vm.$data = value
    }
  }

}