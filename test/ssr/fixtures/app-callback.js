import Vue from '../../../dist/vue.runtime.common.js'

export default context => {
  return new Promise(resolve => {
    const app = new Vue({
      render (h) {
        return h('div', context.url)
      }
    })
    const onComplete = () => { context.msg = 'hello' }
    resolve({ app, onComplete })
  })
}
