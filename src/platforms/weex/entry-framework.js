// this will be preserved during build
const VueFactory = require('./factory')

const instances = {}

/**
 * Prepare framework config.
 * Nothing need to do actually, just an interface provided to weex runtime.
 */
export function init () {}

/**
 * Reset framework config and clear all registrations.
 */
export function reset () {
  clear(instances)
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
  const weex = env.weex
  const document = weex.document
  const instance = instances[instanceId] = {
    instanceId, config, data,
    document
  }

  const timerAPIs = getInstanceTimer(instanceId, weex.requireModule)

  // Each instance has a independent `Vue` module instance
  const Vue = instance.Vue = createVueModuleInstance(instanceId, weex)

  // The function which create a closure the JS Bundle will run in.
  // It will declare some instance variables like `Vue`, HTML5 Timer APIs etc.
  const instanceVars = Object.assign({
    Vue,
    weex
  }, timerAPIs, env.services)

  appCode = `(function(global){ \n${appCode}\n })(Object.create(this))`
  callFunction(instanceVars, appCode)

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
    delete instance.document
    delete instance.app
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
 * Create a fresh instance of Vue for each Weex instance.
 */
function createVueModuleInstance (instanceId, weex) {
  const exports = {}
  VueFactory(exports, weex.document)
  const Vue = exports.Vue

  const instance = instances[instanceId]

  // patch reserved tag detection to account for dynamically registered
  // components
  const weexRegex = /^weex:/i
  const isReservedTag = Vue.config.isReservedTag || (() => false)
  const isRuntimeComponent = Vue.config.isRuntimeComponent || (() => false)
  Vue.config.isReservedTag = name => {
    return (!isRuntimeComponent(name) && weex.supports(`@component/${name}`)) ||
      isReservedTag(name) ||
      weexRegex.test(name)
  }
  Vue.config.parsePlatformTagName = name => name.replace(weexRegex, '')

  // expose weex-specific info
  Vue.prototype.$instanceId = instanceId
  Vue.prototype.$document = instance.document

  // expose weex native module getter on subVue prototype so that
  // vdom runtime modules can access native modules via vnode.context
  Vue.prototype.$requireWeexModule = weex.requireModule

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
    },
    mounted () {
      const options = this.$options
      // root component (vm)
      if (options.el && weex.document) {
        try {
          // Send "createFinish" signal to native.
          weex.document.taskCenter.send('dom', { action: 'createFinish' }, [])
        } catch (e) {}
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
