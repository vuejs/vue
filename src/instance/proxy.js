var _ = require('../util')

/**
 * Proxy the scope properties on the instance itself.
 * So that vm.a === vm.$scope.a.
 *
 * Note this only proxy *local* scope properties.
 * This prevents child instances accidentally modifying properties
 * with the same name up in the scope chain because scope perperties
 * are all getter/setters.
 *
 * To access parent properties through prototypal fall through,
 * access it on the instance's $scope.
 */

exports._initProxy = function () {
  var scope = this.$scope
  for (var key in scope) {
    if (scope.hasOwnProperty(key)) {
      _.proxy(this, scope, key)
    }
  }
  // keep proxying up-to-date with added/deleted keys.
  this._observer
    .on('added:self', function (key) {
      _.proxy(this, scope, key)
    })
    .on('deleted:self', function (key) {
      delete this[key]
    })
}