var _ = require('../util')

// TODO
// placeholder for testing

exports.append = function (el, target, cb) {
  target.appendChild(el)
}

exports.before = function (el, target, cb) {
  _.before(el, target)
}

exports.remove = function (el, cb) {
  _.remove(el)
}

exports.removeThenAppend = function (el, target, cb) {
  setTimeout(function () {
    target.appendChild(el)
    cb && cb()
  }, 500)
}