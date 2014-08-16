var _ = require('../util')
var hasClassList =
  _.inBrowser &&
  'classList' in document.documentElement

/**
 * add class for IE9
 *
 * @param {Element} el
 * @param {Strong} cls
 */

function addClass (el, cls) {
  if (hasClassList) {
    el.classList.add(cls)
  } else {
    var cur = ' ' + el.className + ' '
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.className = (cur + cls).trim()
    }
  }
}

/**
 * remove class for IE9
 *
 * @param {Element} el
 * @param {Strong} cls
 */

function removeClass (el, cls) {
  if (hasClassList) {
    el.classList.remove(cls)
  } else {
    var cur = ' ' + el.className + ' '
    var tar = ' ' + cls + ' '
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ')
    }
    el.className = cur.trim()
  }
}

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