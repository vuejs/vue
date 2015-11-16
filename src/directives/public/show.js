import { attr } from '../../util'
import { applyTransition } from '../../transition'

module.exports = {

  bind: function () {
    // check else block
    var next = this.el.nextElementSibling
    if (next && attr(next, 'v-else') !== null) {
      this.elseEl = next
    }
  },

  update: function (value) {
    this.apply(this.el, value)
    if (this.elseEl) {
      this.apply(this.elseEl, !value)
    }
  },

  apply: function (el, value) {
    applyTransition(el, value ? 1 : -1, function () {
      el.style.display = value ? '' : 'none'
    }, this.vm)
  }
}
