import { getAttr, inDoc } from '../../util/index'
import { applyTransition } from '../../transition/index'

export default {

  bind () {
    // check else block
    let next = this.el.nextElementSibling
    if (next && getAttr(next, 'v-else') !== null) {
      this.elseEl = next
    }
    // we need a second check for components using this directive
    this.checkCounter = 0
  },

  update (value) {
    this.apply(this.el, value)
    if (this.elseEl) {
      this.apply(this.elseEl, !value)
    } else if (this.checkCounter < 2) {
      this.checkCounter++
      let next = this.el.nextElementSibling
      if (next && getAttr(next, 'v-else') !== null) {
        this.elseEl = next
        this.apply(this.elseEl, !value)
      }
    }
  },

  apply (el, value) {
    if (inDoc(el)) {
      applyTransition(el, value ? 1 : -1, toggle, this.vm)
    } else {
      toggle()
    }
    function toggle () {
      el.style.display = value ? '' : 'none'
    }
  }
}
