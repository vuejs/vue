var _ = require('../util')
var templateParser = require('../parsers/template')
var vIf = require('./if')

module.exports = {

  isLiteral: true,

  // same logic reuse from v-if
  compile: vIf.compile,
  teardown: vIf.teardown,

  bind: function () {
    var el = this.el
    this.start = document.createComment('v-partial-start')
    this.end = document.createComment('v-partial-end')
    if (el.nodeType !== 8) {
      el.innerHTML = ''
    }
    if (el.tagName === 'TEMPLATE' || el.nodeType === 8) {
      _.replace(el, this.end)
    } else {
      el.appendChild(this.end)
    }
    _.before(this.start, this.end)
    if (!this._isDynamicLiteral) {
      this.insert(this.expression)
    }
  },

  update: function (id) {
    this.teardown()
    this.insert(id)
  },

  insert: function (id) {
    var partial = this.vm.$options.partials[id]
    _.assertAsset(partial, 'partial', id)
    if (partial) {
      this.compile(templateParser.parse(partial))
    }
  }

}