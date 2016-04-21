exports.assertion = function (selector, expected) {
  this.message = 'Testing if element <' + selector + '> is checked.'
  this.expected = expected !== false
  this.value = function (res) {
    return res.value
  }
  this.pass = function (val) {
    return val === this.expected
  }
  this.command = function (cb) {
    var self = this
    return this.api.execute(function (selector) {
      return document.querySelector(selector).checked
    }, [selector], function (res) {
      cb.call(self, res)
    })
  }
}
