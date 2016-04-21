exports.assertion = function (selector) {
  this.message = 'Testing if element <' + selector + '> is not visible.'
  this.expected = false
  this.pass = function (val) {
    return val === this.expected
  }
  this.value = function (res) {
    return res.value
  }
  this.command = function (cb) {
    var self = this
    return this.api.isVisible(selector, function (res) {
      cb.call(self, res)
    })
  }
}
