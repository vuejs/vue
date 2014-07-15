var Observer = require('../observe/observer')
var scopeEvents = ['set', 'mutate', 'added', 'deleted']

/**
 * Setup scope and listen to parent scope changes.
 * Only called once during _init().
 */

exports._initScope = function (options) {

  var parent = this.$parent = options.parent
  var scope = this.$scope = parent && options._inheritScope !== false
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