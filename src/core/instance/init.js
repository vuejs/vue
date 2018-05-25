/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    // 每个 Vue 实例的 ID
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    // 非正式环境标记实例开始创建的时间戳
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // Vue 实例对象不用被观察，给个标记
    vm._isVue = true
    // merge options
    // TODO 之后注意 options._isComponent = true 的情况，先略过
    // 除了直接使用 vue 类创建的实例，其他的感觉上基本上都为 true
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      // 将 option 与默认的 option 的合并
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    // 非生产环境代理数据，监听错误
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    // 保存自身实例
    vm._self = vm
    // 初始化组件生命周期
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    // 在 beforeCreate 钩子调用前，初始化组件生命周期，时间和 render 函数
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props 获取所有 inject 的值
    initState(vm)// 初始化 data props method watcher computed
    initProvide(vm) // resolve provide after data/props 初始化 Provide
    // 所有的数据都已经监听好，发出 create 事件
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode
  opts._parentElm = options._parentElm
  opts._refElm = options._refElm

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  // super 情况出现在使用 Vue.extend 生成的类，也就是 Vue 的子类
  if (Ctor.super) {
    // TODO 这里仅仅考虑了一层，更多细节还得再看
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      // 父类的 option 发生变化，需要生成新的 options
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      // TODO 这一步不是很了解
      // 主要是 modifiedOptions 最终出来的结果是要和 Ctor.extendOptions 合并的，但是 extendOptions 一般是不会改的
      // 但是 resolveModifiedOptions 方法出来的结果却是 Ctor.options 和 Ctor.sealedOptions 中不同的项
      // 为什么要合并到 Ctor.extendOptions 中呢？仅仅为了方便？
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      // 合并原始值和更新值
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 更新当前类的 options
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const extended = Ctor.extendOptions
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = dedupe(latest[key], extended[key], sealed[key])
    }
  }
  return modified
}

function dedupe (latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  if (Array.isArray(latest)) {
    const res = []
    sealed = Array.isArray(sealed) ? sealed : [sealed]
    extended = Array.isArray(extended) ? extended : [extended]
    for (let i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      // 这里取出的是在 extended 中且不在 sealed 中的项目
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i])
      }
    }
    return res
  } else {
    return latest
  }
}
