exports.assertion = function (fn, args) {
  this.message = 'Testing custom eval...'
  this.expected = true
  this.value = function (res) {
    return res.value
  }
  this.pass = function (val) {
    return val === this.expected
  }
  this.command = function (cb) {
    var self = this
    return this.api.execute(fn, args || [], function (res) {
      cb.call(self, res)
    })
  }
}
