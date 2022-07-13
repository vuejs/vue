import Vue from '../../../dist/vue.runtime.common.js'

// async component!
const Foo = () => import('./async-foo')
const Bar = () => import('./async-bar') // eslint-disable-line

export default context => {
  return new Promise(resolve => {
    const vm = new Vue({
      render (h) {
        return h('div', [
          context.url,
          h(Foo)
        ])
      }
    })

    const onComplete = () => { context.msg = 'hello' }

    // simulate router.onReady
    Foo().then(comp => {
      // resolve now to make the render sync
      Foo.resolved = Vue.extend(comp.default)
      resolve({ app: vm, onComplete })
    })
  })
}
