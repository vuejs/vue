import config from '../config'
import { noop } from 'shared/util'

let warn = noop
let formatComponentName

if (process.env.NODE_ENV !== 'production') {
  const hasConsole = typeof console !== 'undefined'

  warn = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.error(`[Vue warn]: ${msg} ` + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ))
    }
  }

  formatComponentName = vm => {
    if (vm.$root === vm) {
      return 'root instance'
    }
    const name = vm._isVue
      ? vm.$options.name || vm.$options._componentTag
      : vm.name
    return (
      (name ? `component <${name}>` : `anonymous component`) +
      (vm._isVue && vm.$options.__file ? ` at ${vm.$options.__file}` : '')
    )
  }

  const formatLocation = str => {
    if (str === 'anonymous component') {
      str += ` - use the "name" option for better debugging messages.`
    }
    return `\n(found in ${str})`
  }
}

export { warn, formatComponentName }
