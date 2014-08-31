/**
 * Apply JavaScript enter/leave functions.
 *
 * @param {Element} el
 * @param {Number} direction - 1: enter, -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Object} data - target element's transition data
 * @param {Object} def - transition definition object
 */

module.exports = function (el, direction, op, data, def) {
  if (data.cancel) {
    data.cancel()
    data.cancel = null
  }
  if (direction > 0) { // enter
    if (def.beforeEnter) {
      def.beforeEnter(el)
    }
    op()
    if (def.enter) {
      data.cancel = def.enter(el, function () {
        data.cancel = null
      })
    }
  } else { // leave
    if (def.leave) {
      data.cancel = def.leave(el, function () {
        op()
        data.cancel = null
      })
    } else {
      op()
    }
  }
}