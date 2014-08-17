var _ = require('../util')

// TODO
// placeholder for testing

exports.append = function (el, target, cb, vm) {
  target.appendChild(el)
  cb && cb()
}

exports.before = function (el, target, cb, vm) {
  _.before(el, target)
  cb && cb()
}

exports.remove = function (el, cb, vm) {
  _.remove(el)
  cb && cb()
}

exports.removeThenAppend = function (el, target, cb, vm) {
  target.appendChild(el)
  cb && cb()
}

exports.apply = function (el, direction, cb, vm) {
  
}