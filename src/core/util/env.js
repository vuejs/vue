/* @flow */
/* globals MessageChannel */

import { handleError } from './error'

// can we use __proto__?
// 是否有__proto__
export const hasProto = '__proto__' in {}

// Browser environment sniffing
// 是否是浏览器
export const inBrowser = typeof window !== 'undefined'
// userAgent(为什么要小写？？？？？？？？？？？？)
export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
// 是否是ie
export const isIE = UA && /msie|trident/.test(UA)
// 是否是ie9
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
// 是否是edge
export const isEdge = UA && UA.indexOf('edge/') > 0
// 是否是安卓
export const isAndroid = UA && UA.indexOf('android') > 0
// 是否是ios
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)
// 是否是chrome
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge

// Firefox has a "watch" function on Object.prototype...
// 是否有原生的watch  这东西是干嘛的？？？？？？？
export const nativeWatch = ({}).watch

// 是否支持passive，首先addEventListener不支持opts配置，则肯定不支持passive
export let supportsPassive = false
if (inBrowser) {
  try {
    const opts = {}
    Object.defineProperty(opts, 'passive', ({
      get () {
        /* istanbul ignore next */
        supportsPassive = true
      }
    }: Object)) // https://github.com/facebook/flow/issues/285

    // 猜测是出了一个bug，所以使用opts的get看addEventListener有没有访问passive对象效率最高。
    // 事件函数传null，则不用removeEventListener了
    window.addEventListener('test-passive', null, opts)
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
// 是否是服务器运行，ssr。如果不是浏览器而是node环境，并且环境变量为'server'，则是服务器渲染
let _isServer
export const isServerRendering = () => {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'].env.VUE_ENV === 'server'
    } else {
      _isServer = false
    }
  }
  return _isServer
}

// detect devtools
// 是否有devtools。如果是浏览器，并且window有__VUE_DEVTOOLS_GLOBAL_HOOK__变量，则是运行了vue-devtools
// vue-devtools在window上面注册了一个__VUE_DEVTOOLS_GLOBAL_HOOK__。在一个运行了vue-devtools插件的chrome浏览器下，任意一个页面都有__VUE_DEVTOOLS_GLOBAL_HOOK__对象
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

/* istanbul ignore next */
// 是否是原生方法，以便排除是polifill或者是其他开发者自己的变量覆盖了原生方法
export function isNative (Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

// 是否支持Symbol。同时还得支持通过Reflect反射获取Symbol的key
export const hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys)

/**
 * Defer a task to execute it asynchronously.
 */
// 异步回调
/**
 * js相当是一个单线程语言，但是支持异步，js异步就如同消息队列，这就是js的事件循环机制原理。
 * 但是js的任务队列不只一个，大体可分为任务队列和微任务队列两个队列，二者的区别在于优先级，微任务队列的优先级更高。
 * 无论是哪种都需要使用一个函数，将回调放入队列中，等待执行
 * 能将回调放入任务队列的方法有，事件、setTimeout、setInterval
 * 能将回调放入微任务队列的方法有，Promise、MutationObserver
 * vue在 2.4之前是使用微任务队列，但是因为优先级过高，产生了一些bug，发现在连续的事件或同一事件的冒泡中，会有问题
 * 后来改用在ie中用setImmediate，非ie中，使用MessageChanel发送消息来保持callback始终以队列的形式调用的。除非二者不支持，最后才用的setTimeout保底。
 * 既然用任务队列而不是微任务队列，那为什么仅用setTimeout保底，而不直接用setTimeout呢？
 * 笔者认为是setTimeout比较慢，因为即使时间间隔是0，也会有超过4ms的延时，所以比正常放入任务队列里面的还慢，所以不适合做nextTick的实现
 * 同时请参考https://github.com/Jmingzi/blog/issues/27
 */
export const nextTick = (function () {
  // 自己实现一个异步对象，确保每一个方法都是在异步中执行
  const callbacks = []
  // 确保多次执行nexttick后，仅执行一次异步回调
  let pending = false

  // 放入任务队列的函数，相当于settimeout
  let timerFunc

  // 执行vue任务队列的回调
  function nextTickHandler () {
    // 异步回调已经执行，可以开启下次回调
    pending = false

    // 执行所有注册的回到方法，并把队列清空
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  // An asynchronous deferring mechanism.
  // In pre 2.4, we used to use microtasks (Promise/MutationObserver)
  // but microtasks actually has too high a priority and fires in between
  // supposedly sequential events (e.g. #4521, #6690) or even between
  // bubbling of the same event (#6566). Technically setImmediate should be
  // the ideal choice, but it's not available everywhere; and the only polyfill
  // that consistently queues the callback after all DOM events triggered in the
  // same loop is by using MessageChannel.
  /* istanbul ignore if */

  // 异步的实现
  if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    // 浏览器如果支持原生的setImmediate，用setImmediate实现timerFunc
    timerFunc = () => {
      setImmediate(nextTickHandler)
    }
  } else if (typeof MessageChannel !== 'undefined' && (
    isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]'
  )) {
    // 否则浏览器如果支持原生的MessageChannel，用MessageChannel实现timerFunc

    const channel = new MessageChannel()
    const port = channel.port2
    channel.port1.onmessage = nextTickHandler
    timerFunc = () => {
      port.postMessage(1)
    }
  } else
  /* istanbul ignore next */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    // use microtask in non-DOM environments, e.g. Weex
    // 否则浏览器如果支持原生的Promise，用Promise实现timerFunc。主要是给非浏览器环境，如weex。
    // 因为非浏览器环境，不会发生“在连续的事件或同一事件的冒泡中，会有问题”的bug，用微任务队列做效率更高
    const p = Promise.resolve()
    timerFunc = () => {
      p.then(nextTickHandler)
    }
  } else {
    // fallback to setTimeout
    // 都不支持，直接用setTimeout兜底
    timerFunc = () => {
      setTimeout(nextTickHandler, 0)
    }
  }

  // 返回nexttick函数
  // 直接执行nexttick会返回一个promise，这个pomise是会在执行异步回调的时候被resolve掉
  return function queueNextTick (cb?: Function, ctx?: Object) {
    let _resolve
    callbacks.push(() => {
      if (cb) {
        try {
          cb.call(ctx)
        } catch (e) {
          handleError(e, ctx, 'nextTick')
        }
      } else if (_resolve) {
        _resolve(ctx)
      }
    })
    if (!pending) {
      pending = true
      timerFunc()
    }
    // $flow-disable-line
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        _resolve = resolve
      })
    }
  }
})()

let _Set
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = class Set implements ISet {
    set: Object;
    constructor () {
      this.set = Object.create(null)
    }
    has (key: string | number) {
      return this.set[key] === true
    }
    add (key: string | number) {
      this.set[key] = true
    }
    clear () {
      this.set = Object.create(null)
    }
  }
}

interface ISet {
  has(key: string | number): boolean;
  add(key: string | number): mixed;
  clear(): void;
}

export { _Set }
export type { ISet }
