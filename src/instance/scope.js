var Observer = require('../observe/observer')
var scopeEvents = ['set', 'mutate', 'add', 'delete']

/**
 * Setup instance scope.
 * The scope is reponsible for prototypal inheritance of
 * parent instance propertiesm abd all binding paths and
 * expressions of the current instance are evaluated against its scope.
 *
 * This should only be called once during _init().
 */

exports._initScope = function () {
  var parent = this.$parent = this.$options.parent
  var scope = this.$scope = parent
    ? Object.create(parent.$scope)
    : {}
  // create scope observer
  this._observer = Observer.create(scope, {
    callbackContext: this,
    doNotAlterProto: true
  })

  if (!parent) return

  // relay change events that sent down from
  // the scope prototype chain.
  var ob = this._observer
  var pob = parent._observer
  var listeners = this._scopeListeners = {}
  scopeEvents.forEach(function (event) {
    var cb = listeners[event] = function (key, a, b) {
      // since these events come from upstream,
      // we only emit them if we don't have the same keys
      // shadowing them in current scope.
      if (!scope.hasOwnProperty(key)) {
        ob.emit(event, key, a, b)
      }
    }
    pob.on(event, cb)
  })
}

/**
 * Teardown scope and remove listeners attached to parent scope.
 * Only called once during $destroy().
 */

exports._teardownScope = function () {
  this.$scope = null
  if (!this.$parent) return
  var pob = this.$parent._observer
  var listeners = this._scopeListeners
  scopeEvents.forEach(function (event) {
    pob.off(event, listeners[event])
  })
}