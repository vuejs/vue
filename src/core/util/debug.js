import config from '../config'

let warn
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
    return name ? `component <${name}>` : `anonymous component`
  }

  const formatLocation = str => {
    if (str === 'anonymous component') {
      str += ` - use the "name" option for better debugging messages.`
    }
    return `(found in ${str})`
  }
}

export { warn, formatComponentName }
