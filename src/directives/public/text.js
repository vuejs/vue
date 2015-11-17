import { _toString } from '../../util/index'

export default {

  bind () {
    this.attr = this.el.nodeType === 3
      ? 'data'
      : 'textContent'
  },

  update (value) {
    this.el[this.attr] = _toString(value)
  }
}
