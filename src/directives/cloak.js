var config = require('../config')

module.exports = {

  bind: function () {
    var el = this.el
    this.vm._emitter.once('hook:compiled', function () {
      el.removeAttribute(config.prefix + 'cloak')
    })
  }

}