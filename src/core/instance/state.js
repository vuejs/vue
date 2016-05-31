/* @flow */

import Watcher from '../observer/watcher'
import Dep from '../observer/dep'
import {
  observe,
  defineReactive,
  observerState,
  proxy,
  unproxy
} from '../observer/index'
import {
  warn,
  hasOwn,
  isPlainObject,
  bind,
  validateProp,
  noop
} from '../util/index'

export function initState (vm: Component) {
  vm._watchers = []
  initProps(vm)
  initData(vm)
  initComputed(vm)
  initMethods(vm)
  initWatch(vm)
}

function initProps (vm: Component) {
  const props = vm.$options.props
  const propsData = vm.$options.propsData
  if (props) {
    const keys = vm.$options._propKeys = Object.keys(props)
    const isRoot = !vm.$parent
    // root instance props should be converted
    observerState.shouldConvert = isRoot
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      defineReactive(vm, key, validateProp(vm, key, propsData))
    }
    observerState.shouldConvert = true
  }
}

function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? data.call(vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object.',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    proxy(vm, keys[i])
  }
  // observe data
  observe(data)
  data.__ob__.vmCount++
}

const computedSharedDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function initComputed (vm: Component) {
  const computed = vm.$options.computed
  if (computed) {
    for (const key in computed) {
      const userDef = computed[key]
      if (typeof userDef === 'function') {
        computedSharedDefinition.get = makeComputedGetter(userDef, vm)
        computedSharedDefinition.set = noop
      } else {
        computedSharedDefinition.get = userDef.get
          ? userDef.cache !== false
            ? makeComputedGetter(userDef.get, vm)
            : bind(userDef.get, vm)
          : noop
        computedSharedDefinition.set = userDef.set
          ? bind(userDef.set, vm)
          : noop
      }
      Object.defineProperty(vm, key, computedSharedDefinition)
    }
  }
}

function makeComputedGetter (getter: Function, owner: Component): Function {
  const watcher = new Watcher(owner, getter, noop, {
    lazy: true
  })
  return function computedGetter () {
    if (watcher.dirty) {
      watcher.evaluate()
    }
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }
}

function initMethods (vm: Component) {
  const methods = vm.$options.methods
  if (methods) {
    for (const key in methods) {
      vm[key] = bind(methods[key], vm)
    }
  }
}

function initWatch (vm: Component) {
  const watch = vm.$options.watch
  if (watch) {
    for (const key in watch) {
      const handler = watch[key]
      if (Array.isArray(handler)) {
        for (let i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i])
        }
      } else {
        createWatcher(vm, key, handler)
      }
    }
  }
}

function createWatcher (vm: Component, key: string, handler: any) {
  let options
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  vm.$watch(key, handler, options)
}

export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  dataDef.get = function () {
    return this._data
  }
  dataDef.set = function (newData: Object) {
    if (newData !== this._data) {
      setData(this, newData)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ): Function {
    const vm: Component = this
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}

function setData (vm: Component, newData: Object) {
  newData = newData || {}
  const oldData = vm._data
  vm._data = newData
  let keys, key, i
  // unproxy keys not present in new data
  keys = Object.keys(oldData)
  i = keys.length
  while (i--) {
    key = keys[i]
    if (!(key in newData)) {
      unproxy(vm, key)
    }
  }
  // proxy keys not already proxied,
  // and trigger change for changed values
  keys = Object.keys(newData)
  i = keys.length
  while (i--) {
    key = keys[i]
    if (!hasOwn(vm, key)) {
      // new property
      proxy(vm, key)
    }
  }
  oldData.__ob__.vmCount--
  observe(newData)
  newData.__ob__.vmCount++
  vm.$forceUpdate()
}
