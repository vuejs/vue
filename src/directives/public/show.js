var _ = require('../../util')
var transition = require('../../transition')

module.exports = {

  bind: function () {
    // check else block
    var next = this.el.nextElementSibling
    if (next && _.attr(next, 'v-else') !== null) {
      this.elseEl = next
    }
  },

  update: function (value) {
    var el = this.el
    transition.apply(el, value ? 1 : -1, function () {
      el.style.display = value ? '' : 'none'
    }, this.vm)
    var elseEl = this.elseEl
    if (elseEl) {
      transition.apply(elseEl, value ? -1 : 1, function () {
        elseEl.style.display = value ? 'none' : ''
      }, this.vm)
    }
  }
}
