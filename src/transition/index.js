var _ = require('../util')

// TODO
// placeholder for testing

exports.append = function (el, target, cb, vm) {
  target.appendChild(el)
}

exports.before = function (el, target, cb, vm) {
  _.before(el, target)
}

exports.remove = function (el, cb, vm) {
  _.remove(el)
}

exports.removeThenAppend = function (el, target, cb, vm) {
  setTimeout(function () {
    target.appendChild(el)
    cb && cb()
  }, 500)
}

exports.apply = function (el, direction, cb, vm) {
  
}