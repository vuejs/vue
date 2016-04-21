exports.assertion = function (selector, html) {
  this.message = 'Testing if element <' + selector + '> has HTML: ' + html
  this.expected = html
  this.value = function (res) {
    return res.value
  }
  this.pass = function (val) {
    return val.indexOf(html) > -1
  }
  this.command = function (cb) {
    var self = this
    return this.api.execute(function (selector) {
      return document.querySelector(selector).innerHTML
    }, [selector], function (res) {
      cb.call(self, res)
    })
  }
}
