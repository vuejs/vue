import Watcher from '../observer/watcher'
import Dep from '../observer/dep'
import { observe, defineReactive } from '../observer/index'

import {
  warn,
  hasOwn,
  isReserved,
  isPlainObject,
  bind
} from '../util/index'

export function initState (vm) {
  vm._watchers = []
  initProps(vm)
  initData(vm)
  initComputed(vm)
  initMethods(vm)
  initWatch(vm)
}

function initProps (vm) {
  const data = vm.$options._renderData
  const attrs = (data && data.attrs) || {}
  const props = vm.$options.props
  if (props) {
    for (let key in props) {
      defineReactive(vm, key, attrs[key])
    }
  }
}

function initData (vm) {
  var data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? data()
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object.',
      vm
    )
  }
  // proxy data on instance
  var keys = Object.keys(data)
  var i = keys.length
  while (i--) {
    proxy(vm, keys[i])
  }
  // observe data
  observe(data, vm)
}

function noop () {}

function initComputed (vm) {
  var computed = vm.$options.computed
  if (computed) {
    for (var key in computed) {
      var userDef = computed[key]
      var def = {
        enumerable: true,
        configurable: true
      }
      if (typeof userDef === 'function') {
        def.get = makeComputedGetter(userDef, vm)
        def.set = noop
      } else {
        def.get = userDef.get
          ? userDef.cache !== false
            ? makeComputedGetter(userDef.get, vm)
            : bind(userDef.get, vm)
          : noop
        def.set = userDef.set
          ? bind(userDef.set, vm)
          : noop
      }
      Object.defineProperty(vm, key, def)
    }
  }
}

function makeComputedGetter (getter, owner) {
  var watcher = new Watcher(owner, getter, null, {
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

function initMethods (vm) {
  const methods = vm.$options.methods
  if (methods) {
    for (let key in methods) {
      vm[key] = bind(methods[key], vm)
    }
  }
}

function initWatch (vm) {
  const watch = vm.$options.watch
  if (watch) {
    for (let key in watch) {
      let handler = watch[key]
      let options
      if (typeof handler === 'object') {
        options = handler
        handler = handler.handler
      }
      vm.$watch(key, handler, options)
    }
  }
}

export function stateMixin (Vue) {
  Object.defineProperty(Vue.prototype, '$data', {
    get () {
      return this._data
    },
    set (newData) {
      if (newData !== this._data) {
        setData(this, newData)
      }
    }
  })

  Vue.prototype.$watch = function (fn, cb, options) {
    options = options || {}
    options.user = true
    const watcher = new Watcher(this, fn, cb, options)
    if (options.immediate) {
      cb.call(this, watcher.value)
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}

function setData (vm, newData) {
  newData = newData || {}
  var oldData = vm._data
  vm._data = newData
  var keys, key, i
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
  oldData.__ob__.removeVm(vm)
  observe(newData, vm)
  vm.$forceUpdate()
}

function proxy (vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return vm._data[key]
      },
      set: function proxySetter (val) {
        vm._data[key] = val
      }
    })
  }
}

function unproxy (vm, key) {
  if (!isReserved(key)) {
    delete vm[key]
  }
}
