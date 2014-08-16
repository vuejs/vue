var config = require('../config')

module.exports = {

  bind: function () {
    var el = this.el
    this.vm.$once('hook:ready', function () {
      el.removeAttribute(config.prefix + 'cloak')
    })
  }

}