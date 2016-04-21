import Watcher from '../observer/watcher'
import { query, toArray, warn, validateProp } from '../util/index'
import { observerState } from '../observer/index'
import { updateListeners } from '../vdom/helpers'

export function initLifecycle (vm) {
  const options = vm.$options

  vm.$parent = options.parent
  vm.$root = vm.$parent ? vm.$parent.$root : vm
  if (vm.$parent) {
    vm.$parent.$children.push(vm)
  }

  vm.$children = []
  vm.$refs = {}

  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

export function lifecycleMixin (Vue) {
  Vue.prototype.$mount = function (el) {
    if (!this.$options.render) {
      this.$options.render = () => this.$createElement('div')
      if (process.env.NODE_ENV !== 'production') {
        if (this.$options.template) {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'option is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            this
          )
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            this
          )
        }
      }
    }
    callHook(this, 'beforeMount')
    el = this.$el = el && query(el)
    if (el) {
      cleanElement(el)
    }
    this._watcher = new Watcher(this, this._render, this._update)
    this._update(this._watcher.value)
    callHook(this, 'mounted')
    this._mounted = true
    // root instance, call ready on self
    if (this.$root === this) {
      callHook(this, 'ready')
    }
    return this
  }

  Vue.prototype._update = function (vnode) {
    if (this._mounted) {
      callHook(this, 'beforeUpdate')
    }
    const parentNode = this.$options._parentVnode
    // set vnode parent before patch
    vnode.parent = parentNode
    if (!this._vnode) {
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      this.$el = this.__patch__(this.$el, vnode)
    } else {
      this.$el = this.__patch__(this._vnode, vnode)
    }
    this._vnode = vnode
    // set parent vnode element after patch
    if (parentNode) {
      parentNode.elm = this.$el
    }
    if (this._mounted) {
      callHook(this, 'updated')
    }
  }

  Vue.prototype._updateFromParent = function (propsData, listeners, parentVnode, children) {
    this.$options._parentVnode = parentVnode
    this.$options._renderChildren = children
    // update props
    if (propsData && this.$options.props) {
      observerState.shouldConvert = false
      const propKeys = this.$options.propKeys
      for (let i = 0; i < propKeys.length; i++) {
        let key = propKeys[i]
        this[key] = validateProp(this, key, propsData)
      }
      observerState.shouldConvert = true
    }
    // update listeners
    if (listeners) {
      const oldListeners = this.$options._parentListeners
      this.$options._parentListeners = listeners
      updateListeners(listeners, oldListeners || {}, (event, handler) => {
        this.$on(event, handler)
      })
    }
  }

  Vue.prototype.$forceUpdate = function () {
    this._watcher.update()
  }

  Vue.prototype.$destroy = function () {
    if (this._isDestroyed) {
      return
    }
    callHook(this, 'beforeDestroy')
    this._isBeingDestroyed = true
    // remove self from parent
    const parent = this.$parent
    if (parent && !parent._isBeingDestroyed) {
      parent.$children.$remove(this)
    }
    // unregister ref
    if (this._ref) {
      this._context.$refs[this._ref] = undefined
    }
    // teardown watchers
    let i = this._watchers.length
    while (i--) {
      this._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (this._data.__ob__) {
      this._data.__ob__.removeVm(this)
    }
    // call the last hook...
    this._isDestroyed = true
    callHook(this, 'destroyed')
    // turn off all instance listeners.
    this.$off()
  }
}

export function callHook (vm, hook) {
  vm.$emit('pre-hook:' + hook)
  var handlers = vm.$options[hook]
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm)
    }
  }
  vm.$emit('hook:' + hook)
}

function cleanElement (el) {
  el.innerHTML = ''
  if (el.hasAttributes()) {
    const attrs = toArray(el.attributes)
    for (let i = 0; i < attrs.length; i++) {
      el.removeAttribute(attrs[i].name)
    }
  }
}
