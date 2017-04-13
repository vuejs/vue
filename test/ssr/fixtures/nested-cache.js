/* globals __VUE_SSR_CONTEXT__ */

import Vue from '../../../dist/vue.runtime.common.js'

function register (id, context) {
  context = context || __VUE_SSR_CONTEXT__
  context.registered.push(id)
}

const grandchild = {
  name: 'grandchild',
  props: ['id'],
  _ssrRegister: context => {
    register('grandchild', context)
  },
  beforeCreate () {
    register('grandchild')
  },
  serverCacheKey: props => props.id,
  render (h) {
    return h('div', '/test')
  }
}

const child = {
  name: 'child',
  props: ['id'],
  _ssrRegister: context => {
    register('child', context)
  },
  beforeCreate () {
    register('child')
  },
  serverCacheKey: props => props.id,
  render (h) {
    return h(grandchild, { props: { id: this.id }})
  }
}

const app = {
  name: 'app',
  props: ['id'],
  _ssrRegister: context => {
    register('app', context)
  },
  beforeCreate () {
    register('app')
  },
  serverCacheKey: props => props.id,
  render (h) {
    return h(child, { props: { id: this.id }})
  }
}

export default () => {
  return Promise.resolve(new Vue({
    render: h => h(app, { props: { id: 1 }})
  }))
}
