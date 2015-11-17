import { getAttr } from '../../util/index'
import { applyTransition } from '../../transition/index'

export default {

  bind () {
    // check else block
    var next = this.el.nextElementSibling
    if (next && getAttr(next, 'v-else') !== null) {
      this.elseEl = next
    }
  },

  update (value) {
    this.apply(this.el, value)
    if (this.elseEl) {
      this.apply(this.elseEl, !value)
    }
  },

  apply (el, value) {
    applyTransition(el, value ? 1 : -1, function () {
      el.style.display = value ? '' : 'none'
    }, this.vm)
  }
}
