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
    this.apply(this.el, value)
    if (this.elseEl) {
      this.apply(this.elseEl, !value)
    }
  },

  apply: function (el, value) {
    function done () {
      el.style.display = value ? '' : 'none'
    }
    // do not apply transition if not in doc
    if (_.inDoc(el)) {
      transition.apply(el, value ? 1 : -1, done, this.vm)
    } else {
      done()
    }
  }
}
