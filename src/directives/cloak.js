var config = require('../config')

module.exports = {

  literal: true,

  bind: function () {
    var el = this.el
    this.vm.$once('hook:ready', function () {
      el.removeAttribute(config.prefix + 'cloak')
    })
  }

}