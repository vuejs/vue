/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target 
 */

exports.before = function (el, target) {
  target.parentNode.insertBefore(el, target)
}

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target 
 */

exports.after = function (el, target) {
  if (target.nextSibling) {
    exports.before(el, target.nextSibling)
  } else {
    target.parentNode.appendChild(el)
  }
}

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

exports.remove = function (el) {
  el.parentNode.removeChild(el)
}

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target 
 */

exports.prepend = function (el, target) {
  if (target.firstChild) {
    exports.before(el, target.firstChild)
  } else {
    target.appendChild(el)
  }
}

/**
 * Copy attributes from one element to another.
 *
 * @param {Element} from
 * @param {Element} to
 */

exports.copyAttributes = function (from, to) {
  if (from.hasAttributes()) {
    var attrs = from.attributes
    for (var i = 0, l = attrs.length; i < l; i++) {
      var attr = attrs[i]
      to.setAttribute(attr.name, attr.value)
    }
  }
}