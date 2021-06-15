/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype// 复制数组构造函数的原型，Array.prototype也是一个数组
export const arrayMethods = Object.create(arrayProto)// 创建对象，对象的__proto__指向arrayProto，所以arrayMethods的__proto__包含数组的所有方法。

// 下面的数组是要进行重写的方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {// 遍历methodsToPatch数组，对其中的方法进行重写
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {// def方法定义在lang.js文件中，是通过object.defineProperty对属性进行重新定义。
    // 即在arrayMethods中找到我们要重写的方法，对其进行重新定义
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {// 上面已经分析过，对于push，unshift会新增索引，所以需要手动observe
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':// splice方法，如果传入了第三个参数，也会有新增索引，所以也需要手动observe
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)// push，unshift，splice三个方法触发后，在这里手动observe，其他方法的变更会在当前的索引上进行更新，所以不需要再执行ob.observeArray
    // notify change
    ob.dep.notify()
    return result
  })
})
