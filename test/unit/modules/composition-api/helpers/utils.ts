const Vue = require('vue/dist/vue.common.js')

export function nextTick(): Promise<any> {
  return Vue.nextTick()
}

export function sleep(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
