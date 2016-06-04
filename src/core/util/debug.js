import config from '../config'
import { hyphenate } from 'shared/util'

let warn
let formatComponentName

if (process.env.NODE_ENV !== 'production') {
  const hasConsole = typeof console !== 'undefined'

  warn = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.error('[Vue warn]: ' + msg + (vm ? formatComponentName(vm) : ''))
    }
  }

  formatComponentName = vm => {
    if (vm.$root === vm) {
      return ' (found in root instance)'
    }
    const name = vm._isVue
      ? vm.$options.name || vm.$options._componentTag
      : vm.name
    return name
      ? ' (found in component: <' + hyphenate(name) + '>)'
      : ' (found in anonymous component. Use the "name" option for better debugging messages)'
  }
}

export { warn }
