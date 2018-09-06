/* @flow */

import config from '../config'
import { noop } from 'shared/util'

// 警告
export let warn = noop
// 提示
export let tip = noop
// 获取堆栈调用
export let generateComponentTrace// = (noop: any); // work around flow check
// 格式化控件名称
export let formatComponentName// = (noop: any);

// 如果是在生产环境下，不使给以上方法做实现
if (process.env.NODE_ENV !== 'production') {
  const hasConsole = typeof console !== 'undefined'

  // 下划线转驼峰
  const classifyRE = /(?:^|[-_])(\w)/g
  const classify = str => str
    .replace(classifyRE, c => c.toUpperCase())
    .replace(/[-_]/g, '')

  warn = (msg, vm) => {
    const trace = vm ? generateComponentTrace(vm) : ''

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace)
    } else if (hasConsole && (!config.silent)) {
      console.error(`[Vue warn]: ${msg}${trace}`)
    }
  }

  tip = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.warn(`[Vue tip]: ${msg}` + (
        vm ? generateComponentTrace(vm) : ''
      ))
    }
  }

  // 格式化控件的名字
  formatComponentName = (vm, includeFile) => {
    // 如果是根路径，直接显示<Root>
    if (vm.$root === vm) {
      return '<Root>'
    }

    // 控件有名字使用名字
    const options = typeof vm === 'function' && vm.cid != null
      ? vm.options
      : vm._isVue
        ? vm.$options || vm.constructor.options
        : vm || {}
    let name = options.name || options._componentTag
    const file = options.__file

    // 如果没有名字，但是有vue文件，用vue文件名命名
    if (!name && file) {
      const match = file.match(/([^/\\]+)\.vue$/)
      name = match && match[1]
    }

    // 如果都没有，叫Anonymous
    return (
      (name ? `<${classify(name)}>` : `<Anonymous>`) +
      (file && includeFile !== false ? ` at ${file}` : '')
    )
  }

  const repeat = (str, n) => {
    let res = ''
    while (n) {
      if (n % 2 === 1) res += str
      if (n > 1) str += str
      n >>= 1
    }
    return res
  }

  // 创建控件的引用轨迹，并序列化为控件名字的列表返回
  generateComponentTrace = vm => {
    if (vm._isVue && vm.$parent) {
      // 使用tree做栈代替递归，获取当前节点的所有父节点，并保存到tree里面
      const tree = []
      let currentRecursiveSequence = 0
      while (vm) {
        if (tree.length > 0) {
          const last = tree[tree.length - 1]
          // 如果是组件递归调用，要统计递归的次数
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++
            vm = vm.$parent
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence]
            currentRecursiveSequence = 0
            // 将递归组在tree用一个数组保存，如：
            // Root > Ul > Li > MyRecursive > MyRecursive > MyRecursive，tree保存的结果为：
            // [Root, Ul, Li, [MyRecursive, 3]]
          }
        }
        tree.push(vm)
        vm = vm.$parent
      }
      // 将tree序列化为控件名字的列表返回
      return '\n\nfound in\n\n' + tree
        .map((vm, i) => `${
          i === 0 ? '---> ' : repeat(' ', 5 + i * 2)
        }${
          Array.isArray(vm)
            ? `${formatComponentName(vm[0])}... (${vm[1]} recursive calls)`
            : formatComponentName(vm)
        }`)
        .join('\n')
    } else {
      return `\n\n(found in ${formatComponentName(vm)})`
    }
  }
}
