var _ = require('../../util')

var handlers = {
  text: require('./text'),
  radio: require('./radio'),
  select: require('./select'),
  checkbox: require('./checkbox')
}

module.exports = {

  priority: 800,
  twoWay: true,
  handlers: handlers,

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   *     - TODO: more types may be supplied as a plugin
   */

  bind: function () {
    var el = this.el
    var tag = el.tagName
    var handler
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text
    } else if (tag === 'SELECT') {
      handler = handlers.select
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text
    } else {
      _.warn("v-model doesn't support element type: " + tag)
      return
    }
    handler.bind.call(this)
    this.update = handler.update
    this.unbind = handler.unbind
  }

}