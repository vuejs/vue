var _ = require('../util')
var inDoc = _.inDoc

/**
 * Setup the instance's option events & watchers.
 * If the value is a string, we pull it from the
 * instance's methods by name.
 */

exports._initEvents = function () {
  var options = this.$options
  registerCallbacks(this, '$on', options.events)
  registerCallbacks(this, '$watch', options.watch)
}

/**
 * Register callbacks for option events and watchers.
 *
 * @param {Vue} vm
 * @param {String} action
 * @param {Object} hash
 */

function registerCallbacks (vm, action, hash) {
  if (!hash) return
  var handlers, key, i, j
  for (key in hash) {
    var isWatchAll = action === '$watch'
              && (key === '*' || (/.\.\*$/).test(key))

    handlers = hash[key]
    if (_.isArray(handlers)) {
      for (i = 0, j = handlers.length; i < j; i++) {
        if (isWatchAll) {
          watchAll(vm, key, handlers[i])
        } else {
          register(vm, action, key, handlers[i])
        }
      }
    } else {
      if (isWatchAll) {
        watchAll(vm, key, handlers)
      } else {
        register(vm, action, key, handlers)
      }
    }
  }
}

function getMethod (vm, action, key, handler) {
  var name = handler
  var methods = vm.$options.methods
  handler = methods && methods[name]
  if (!handler) {
    _.warn(
      'Unknown method: "' + handler + '" when ' +
      'registering callback for ' + action +
      ': "' + key + '".'
    )
  }
  return handler
}

function watchAll (vm, exp, handler) {
  var prefix = ''
  var obj
  if (exp === '*') {
    obj = vm.$data
  } else {
    var path = exp.substr(0, exp.length - '.*'.length)
    obj = vm.$get(path)
    if (!obj) return
    prefix = path + '.'
  }

  var keys = Object.keys(obj) 
  return keys.forEach(function (aKey) {
    if (typeof handler === 'string') {
      handler = getMethod(vm, '$watch', aKey, handler)
    }
    if (handler) {
      (function (handler, aKey) {
        vm.$watch(aKey, handler)
      })(_.methodize(handler, aKey), prefix + aKey)
    }
  })
}

/**
 * Helper to register an event/watch callback.
 *
 * @param {Vue} vm
 * @param {String} action
 * @param {String} key
 * @param {*} handler
 */

function register (vm, action, key, handler) {
  if (typeof handler === 'string') {
    handler = getMethod(vm, action, key, handler)
  }
  if (handler) {
    vm[action](key, handler)
  }
}

/**
 * Setup recursive attached/detached calls
 */

exports._initDOMHooks = function () {
  this.$on('hook:attached', onAttached)
  this.$on('hook:detached', onDetached)
}

/**
 * Callback to recursively call attached hook on children
 */

function onAttached () {
  this._isAttached = true
  this._children.forEach(callAttach)
  if (this._transCpnts) {
    this._transCpnts.forEach(callAttach)
  }
}

/**
 * Iterator to call attached hook
 * 
 * @param {Vue} child
 */

function callAttach (child) {
  if (!child._isAttached && inDoc(child.$el)) {
    child._callHook('attached')
  }
}

/**
 * Callback to recursively call detached hook on children
 */

function onDetached () {
  this._isAttached = false
  this._children.forEach(callDetach)
  if (this._transCpnts) {
    this._transCpnts.forEach(callDetach)
  }
}

/**
 * Iterator to call detached hook
 * 
 * @param {Vue} child
 */

function callDetach (child) {
  if (child._isAttached && !inDoc(child.$el)) {
    child._callHook('detached')
  }
}

/**
 * Trigger all handlers for a hook
 *
 * @param {String} hook
 */

exports._callHook = function (hook) {
  var handlers = this.$options[hook]
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(this)
    }
  }
  this.$emit('hook:' + hook)
}