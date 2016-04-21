exports.assertion = function (selector, attr) {
  this.message = 'Testing if element <' + selector + '> has attribute ' + attr + '.'
  this.expected = true
  this.value = function (res) {
    return res.value
  }
  this.pass = function (val) {
    return val === this.expected
  }
  this.command = function (cb) {
    var self = this
    return this.api.execute(function (selector, attr) {
      return document.querySelector(selector).hasAttribute(attr)
    }, [selector, attr], function (res) {
      cb.call(self, res)
    })
  }
}
