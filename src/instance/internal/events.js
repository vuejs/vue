import { isSimplePath } from '../../parsers/expression'
import {
  inDoc,
  isArray,
  warn
} from '../../util/index'

const eventRE = /^v-on:|^@/

export default function (Vue) {
  /**
   * Setup the instance's option events & watchers.
   * If the value is a string, we pull it from the
   * instance's methods by name.
   */

  Vue.prototype._initEvents = function () {
    var options = this.$options
    if (options._asComponent) {
      registerComponentEvents(this, options.el)
    }
    registerCallbacks(this, '$on', options.events)
    registerCallbacks(this, '$watch', options.watch)
  }

  /**
   * Register v-on events on a child component
   *
   * @param {Vue} vm
   * @param {Element} el
   */

  function registerComponentEvents (vm, el) {
    var attrs = el.attributes
    var name, value, handler
    for (var i = 0, l = attrs.length; i < l; i++) {
      name = attrs[i].name
      if (eventRE.test(name)) {
        name = name.replace(eventRE, '')
        // force the expression into a statement so that
        // it always dynamically resolves the method to call (#2670)
        // kinda ugly hack, but does the job.
        value = attrs[i].value
        if (isSimplePath(value)) {
          value += '.apply(this, $arguments)'
        }
        handler = (vm._scope || vm._context).$eval(value, true)
        handler._fromParent = true
        vm.$on(name.replace(eventRE), handler)
      }
    }
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
      handlers = hash[key]
      if (isArray(handlers)) {
        for (i = 0, j = handlers.length; i < j; i++) {
          register(vm, action, key, handlers[i])
        }
      } else {
        register(vm, action, key, handlers)
      }
    }
  }

  /**
   * Helper to register an event/watch callback.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {String} key
   * @param {Function|String|Object} handler
   * @param {Object} [options]
   */

  function register (vm, action, key, handler, options) {
    var type = typeof handler
    if (type === 'function') {
      vm[action](key, handler, options)
    } else if (type === 'string') {
      var methods = vm.$options.methods
      var method = methods && methods[handler]
      if (method) {
        vm[action](key, method, options)
      } else {
        process.env.NODE_ENV !== 'production' && warn(
          'Unknown method: "' + handler + '" when ' +
          'registering callback for ' + action +
          ': "' + key + '".',
          vm
        )
      }
    } else if (handler && type === 'object') {
      register(vm, action, key, handler.handler, handler)
    }
  }

  /**
   * Setup recursive attached/detached calls
   */

  Vue.prototype._initDOMHooks = function () {
    this.$on('hook:attached', onAttached)
    this.$on('hook:detached', onDetached)
  }

  /**
   * Callback to recursively call attached hook on children
   */

  function onAttached () {
    if (!this._isAttached) {
      this._isAttached = true
      this.$children.forEach(callAttach)
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
    if (this._isAttached) {
      this._isAttached = false
      this.$children.forEach(callDetach)
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

  Vue.prototype._callHook = function (hook) {
    this.$emit('pre-hook:' + hook)
    var handlers = this.$options[hook]
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(this)
      }
    }
    this.$emit('hook:' + hook)
  }
}
