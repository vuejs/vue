var _ = require('../util')
var hasClassList =
  typeof document !== 'undefined' &&
  'classList' in document.documentElement

/**
 * add class for IE9
 *
 * @param {Element} el
 * @param {Strong} cls
 */

var addClass = hasClassList
  ? function (el, cls) {
      el.classList.add(cls)
    }
  : _.addClass

/**
 * remove class for IE9
 *
 * @param {Element} el
 * @param {Strong} cls
 */

var removeClass = hasClassList
  ? function (el, cls) {
      el.classList.remove(cls)
    }
  : _.removeClass

module.exports = function (value) {
  if (this.arg) {
    var method = value ? addClass : removeClass
    method(this.el, this.arg)
  } else {
    if (this.lastVal) {
      removeClass(this.el, this.lastVal)
    }
    if (value) {
      addClass(this.el, value)
      this.lastVal = value
    }
  }
}