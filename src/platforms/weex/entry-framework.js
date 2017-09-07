import TextNode from 'weex/runtime/text-node'

// this will be preserved during build
const VueFactory = require('./factory')

const instances = {}
const modules = {}
const components = {}

const renderer = {
  TextNode,
  instances,
  modules,
  components
}

/**
 * Prepare framework config, basically about the virtual-DOM and JS bridge.
 * @param {object} cfg
 */
export function init (cfg) {
  renderer.Document = cfg.Document
  renderer.Element = cfg.Element
  renderer.Comment = cfg.Comment
  renderer.compileBundle = cfg.compileBundle
}

/**
 * Reset framework config and clear all registrations.
 */
export function reset () {
  clear(instances)
  clear(modules)
  clear(components)
  delete renderer.Document
  delete renderer.Element
  delete renderer.Comment
  delete renderer.compileBundle
}

/**
 * Delete all keys of an object.
 * @param {object} obj
 */
function clear (obj) {
  for (const key in obj) {
    delete obj[key]
  }
}

/**
 * Create an instance with id, code, config and external data.
 * @param {string} instanceId
 * @param {string} appCode
 * @param {object} config
 * @param {object} data
 * @param {object} env { info, config, services }
 */
export function createInstance (
  instanceId,
  appCode = '',
  config = {},
  data,
  env = {}
) {
  // Virtual-DOM object.
  const document = new renderer.Document(instanceId, config.bundleUrl)

  const instance = instances[instanceId] = {
    instanceId, config, data,
    document
  }

  // Prepare native module getter and HTML5 Timer APIs.
  const moduleGetter = genModuleGetter(instanceId)
  const timerAPIs = getInstanceTimer(instanceId, moduleGetter)

  // Prepare `weex` instance variable.
  const weexInstanceVar = {
    config,
    document,
    supports,
    requireModule: moduleGetter
  }
  Object.freeze(weexInstanceVar)

  // Each instance has a independent `Vue` module instance
  const Vue = instance.Vue = createVueModuleInstance(instanceId, moduleGetter)

  // The function which create a closure the JS Bundle will run in.
  // It will declare some instance variables like `Vue`, HTML5 Timer APIs etc.
  const instanceVars = Object.assign({
    Vue,
    weex: weexInstanceVar
  }, timerAPIs, env.services)

  appCode = `(function(global){ \n${appCode}\n })(Object.create(this))`

  if (!callFunctionNative(instanceVars, appCode)) {
    // If failed to compile functionBody on native side,
    // fallback to 'callFunction()'.
    callFunction(instanceVars, appCode)
  }

  // Send `createFinish` signal to native.
  instance.document.taskCenter.send('dom', { action: 'createFinish' }, [])

  return instance
}

/**
 * Destroy an instance with id. It will make sure all memory of
 * this instance released and no more leaks.
 * @param {string} instanceId
 */
export function destroyInstance (instanceId) {
  const instance = instances[instanceId]
  if (instance && instance.app instanceof instance.Vue) {
    instance.document.destroy()
    instance.app.$destroy()
  }
  delete instances[instanceId]
}

/**
 * Refresh an instance with id and new top-level component data.
 * It will use `Vue.set` on all keys of the new data. So it's better
 * define all possible meaningful keys when instance created.
 * @param {string} instanceId
 * @param {object} data
 */
export function refreshInstance (instanceId, data) {
  const instance = instances[instanceId]
  if (!instance || !(instance.app instanceof instance.Vue)) {
    return new Error(`refreshInstance: instance ${instanceId} not found!`)
  }
  for (const key in data) {
    instance.Vue.set(instance.app, key, data[key])
  }
  // Finally `refreshFinish` signal needed.
  instance.document.taskCenter.send('dom', { action: 'refreshFinish' }, [])
}

/**
 * Get the JSON object of the root element.
 * @param {string} instanceId
 */
export function getRoot (instanceId) {
  const instance = instances[instanceId]
  if (!instance || !(instance.app instanceof instance.Vue)) {
    return new Error(`getRoot: instance ${instanceId} not found!`)
  }
  return instance.app.$el.toJSON()
}

const jsHandlers = {
  fireEvent: (id, ...args) => {
    return fireEvent(instances[id], ...args)
  },
  callback: (id, ...args) => {
    return callback(instances[id], ...args)
  }
}

function fireEvent (instance, nodeId, type, e, domChanges) {
  const el = instance.document.getRef(nodeId)
  if (el) {
    return instance.document.fireEvent(el, type, e, domChanges)
  }
  return new Error(`invalid element reference "${nodeId}"`)
}

function callback (instance, callbackId, data, ifKeepAlive) {
  const result = instance.document.taskCenter.callback(callbackId, data, ifKeepAlive)
  instance.document.taskCenter.send('dom', { action: 'updateFinish' }, [])
  return result
}

/**
 * Accept calls from native (event or callback).
 *
 * @param  {string} id
 * @param  {array} tasks list with `method` and `args`
 */
export function receiveTasks (id, tasks) {
  const instance = instances[id]
  if (instance && Array.isArray(tasks)) {
    const results = []
    tasks.forEach((task) => {
      const handler = jsHandlers[task.method]
      const args = [...task.args]
      /* istanbul ignore else */
      if (typeof handler === 'function') {
        args.unshift(id)
        results.push(handler(...args))
      }
    })
    return results
  }
  return new Error(`invalid instance id "${id}" or tasks`)
}

/**
 * Register native modules information.
 * @param {object} newModules
 */
export function registerModules (newModules) {
  for (const name in newModules) {
    if (!modules[name]) {
      modules[name] = {}
    }
    newModules[name].forEach(method => {
      if (typeof method === 'string') {
        modules[name][method] = true
      } else {
        modules[name][method.name] = method.args
      }
    })
  }
}

/**
 * Check whether the module or the method has been registered.
 * @param {String} module name
 * @param {String} method name (optional)
 */
export function isRegisteredModule (name, method) {
  if (typeof method === 'string') {
    return !!(modules[name] && modules[name][method])
  }
  return !!modules[name]
}

/**
 * Register native components information.
 * @param {array} newComponents
 */
export function registerComponents (newComponents) {
  if (Array.isArray(newComponents)) {
    newComponents.forEach(component => {
      if (!component) {
        return
      }
      if (typeof component === 'string') {
        components[component] = true
      } else if (typeof component === 'object' && typeof component.type === 'string') {
        components[component.type] = component
      }
    })
  }
}

/**
 * Check whether the component has been registered.
 * @param {String} component name
 */
export function isRegisteredComponent (name) {
  return !!components[name]
}

/**
 * Detects whether Weex supports specific features.
 * @param {String} condition
 */
export function supports (condition) {
  if (typeof condition !== 'string') return null

  const res = condition.match(/^@(\w+)\/(\w+)(\.(\w+))?$/i)
  if (res) {
    const type = res[1]
    const name = res[2]
    const method = res[4]
    switch (type) {
      case 'module': return isRegisteredModule(name, method)
      case 'component': return isRegisteredComponent(name)
    }
  }

  return null
}

/**
 * Create a fresh instance of Vue for each Weex instance.
 */
function createVueModuleInstance (instanceId, moduleGetter) {
  const exports = {}
  VueFactory(exports, renderer)
  const Vue = exports.Vue

  const instance = instances[instanceId]

  // patch reserved tag detection to account for dynamically registered
  // components
  const weexRegex = /^weex:/i
  const isReservedTag = Vue.config.isReservedTag || (() => false)
  const isRuntimeComponent = Vue.config.isRuntimeComponent || (() => false)
  Vue.config.isReservedTag = name => {
    return (!isRuntimeComponent(name) && components[name]) ||
      isReservedTag(name) ||
      weexRegex.test(name)
  }
  Vue.config.parsePlatformTagName = name => name.replace(weexRegex, '')

  // expose weex-specific info
  Vue.prototype.$instanceId = instanceId
  Vue.prototype.$document = instance.document

  // expose weex native module getter on subVue prototype so that
  // vdom runtime modules can access native modules via vnode.context
  Vue.prototype.$requireWeexModule = moduleGetter

  // Hack `Vue` behavior to handle instance information and data
  // before root component created.
  Vue.mixin({
    beforeCreate () {
      const options = this.$options
      // root component (vm)
      if (options.el) {
        // set external data of instance
        const dataOption = options.data
        const internalData = (typeof dataOption === 'function' ? dataOption() : dataOption) || {}
        options.data = Object.assign(internalData, instance.data)
        // record instance by id
        instance.app = this
      }
    }
  })

  /**
   * @deprecated Just instance variable `weex.config`
   * Get instance config.
   * @return {object}
   */
  Vue.prototype.$getConfig = function () {
    if (instance.app instanceof Vue) {
      return instance.config
    }
  }

  return Vue
}

/**
 * Generate native module getter. Each native module has several
 * methods to call. And all the behaviors is instance-related. So
 * this getter will return a set of methods which additionally
 * send current instance id to native when called.
 * @param  {string}  instanceId
 * @return {function}
 */
function genModuleGetter (instanceId) {
  const instance = instances[instanceId]
  return function (name) {
    const nativeModule = modules[name] || []
    const output = {}
    for (const methodName in nativeModule) {
      Object.defineProperty(output, methodName, {
        enumerable: true,
        configurable: true,
        get: function proxyGetter () {
          return (...args) => {
            return instance.document.taskCenter.send('module', { module: name, method: methodName }, args)
          }
        },
        set: function proxySetter (val) {
          if (typeof val === 'function') {
            return instance.document.taskCenter.send('module', { module: name, method: methodName }, [val])
          }
        }
      })
    }
    return output
  }
}

/**
 * Generate HTML5 Timer APIs. An important point is that the callback
 * will be converted into callback id when sent to native. So the
 * framework can make sure no side effect of the callback happened after
 * an instance destroyed.
 * @param  {[type]} instanceId   [description]
 * @param  {[type]} moduleGetter [description]
 * @return {[type]}              [description]
 */
function getInstanceTimer (instanceId, moduleGetter) {
  const instance = instances[instanceId]
  const timer = moduleGetter('timer')
  const timerAPIs = {
    setTimeout: (...args) => {
      const handler = function () {
        args[0](...args.slice(2))
      }

      timer.setTimeout(handler, args[1])
      return instance.document.taskCenter.callbackManager.lastCallbackId.toString()
    },
    setInterval: (...args) => {
      const handler = function () {
        args[0](...args.slice(2))
      }

      timer.setInterval(handler, args[1])
      return instance.document.taskCenter.callbackManager.lastCallbackId.toString()
    },
    clearTimeout: (n) => {
      timer.clearTimeout(n)
    },
    clearInterval: (n) => {
      timer.clearInterval(n)
    }
  }
  return timerAPIs
}

/**
 * Call a new function body with some global objects.
 * @param  {object} globalObjects
 * @param  {string} code
 * @return {any}
 */
function callFunction (globalObjects, body) {
  const globalKeys = []
  const globalValues = []
  for (const key in globalObjects) {
    globalKeys.push(key)
    globalValues.push(globalObjects[key])
  }
  globalKeys.push(body)

  const result = new Function(...globalKeys)
  return result(...globalValues)
}

/**
 * Call a new function generated on the V8 native side.
 *
 * This function helps speed up bundle compiling. Normally, the V8
 * engine needs to download, parse, and compile a bundle on every
 * visit. If 'compileBundle()' is available on native side,
 * the downloading, parsing, and compiling steps would be skipped.
 * @param  {object} globalObjects
 * @param  {string} body
 * @return {boolean}
 */
function callFunctionNative (globalObjects, body) {
  if (typeof renderer.compileBundle !== 'function') {
    return false
  }

  let fn = void 0
  let isNativeCompileOk = false
  let script = '(function ('
  const globalKeys = []
  const globalValues = []
  for (const key in globalObjects) {
    globalKeys.push(key)
    globalValues.push(globalObjects[key])
  }
  for (let i = 0; i < globalKeys.length - 1; ++i) {
    script += globalKeys[i]
    script += ','
  }
  script += globalKeys[globalKeys.length - 1]
  script += ') {'
  script += body
  script += '} )'

  try {
    const weex = globalObjects.weex || {}
    const config = weex.config || {}
    fn = renderer.compileBundle(script,
      config.bundleUrl,
      config.bundleDigest,
      config.codeCachePath)
    if (fn && typeof fn === 'function') {
      fn(...globalValues)
      isNativeCompileOk = true
    }
  } catch (e) {
    console.error(e)
  }

  return isNativeCompileOk
}
