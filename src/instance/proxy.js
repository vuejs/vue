var _ = require('../util')

/**
 * Proxy the scope properties on the instance itself,
 * so that vm.a === vm.$scope.a.
 *
 * Note this only proxies *local* scope properties. We want to
 * prevent child instances accidentally modifying properties
 * with the same name up in the scope chain because scope
 * perperties are all getter/setters.
 *
 * To access parent properties through prototypal fall through,
 * access it on the instance's $scope.
 *
 * This should only be called once during _init().
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
    .on('add:self', function (key) {
      _.proxy(this, scope, key)
    })
    .on('delete:self', function (key) {
      delete this[key]
    })
}