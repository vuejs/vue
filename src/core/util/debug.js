import config from '../config'
import { noop } from 'shared/util'

let warn = noop
let tip = noop
let formatComponentName

if (process.env.NODE_ENV !== 'production') {
  const hasConsole = typeof console !== 'undefined'
  const classifyRE = /(?:^|[-_])(\w)/g
  const classify = str => str
    .replace(classifyRE, c => c.toUpperCase())
    .replace(/[-_]/g, '')

  warn = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.error(`[Vue warn]: ${msg} ` + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ))
    }
  }

  tip = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.warn(`[Vue tip]: ${msg} ` + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ))
    }
  }

  formatComponentName = (vm, includeFile) => {
    if (vm.$root === vm) {
      return '<Root>'
    }
    let name = typeof vm === 'function' && vm.options
      ? vm.options.name
      : vm._isVue
        ? vm.$options.name || vm.$options._componentTag
        : vm.name

    const file = vm._isVue && vm.$options.__file
    if (!name && file) {
      const match = file.match(/([^/\\]+)\.vue$/)
      name = match && match[1]
    }

    return (
      (name ? `<${classify(name)}>` : `<Anonymous>`) +
      (file && includeFile !== false ? ` at ${file}` : '')
    )
  }

  const formatLocation = str => {
    if (str === `<Anonymous>`) {
      str += ` - use the "name" option for better debugging messages.`
    }
    return `\n(found in ${str})`
  }
}

export { warn, tip, formatComponentName }
