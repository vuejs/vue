export function initInjections (vm) {
  const { provide, inject } = vm.$options
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
  if (inject) {
    const isArray = Array.isArray(inject)
    const keys = isArray ? inject : Object.keys(inject)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const provideKey = isArray ? key : inject[key]
      let source = vm
      while (source) {
        if (source._provided && source._provided[provideKey]) {
          vm[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
    }
  }
}
