import { Vue } from '../../dist/server-renderer.js'

// TODO: test custom server-side directives

describe('SSR: Vue', () => {
  it('$isServerRenderer on Vue prototype', () => {
    const vm = new Vue({
      data: {
        foo: 'server',
        bar: 'rendering'
      }
    })
    expect(Vue.prototype.$isServerRenderer).toBe(true)
    expect(vm.$isServerRenderer).toBe(true)
  })

  it('no data observations', () => {
    const vm = new Vue({
      data: {
        foo: 'server',
        bar: 'rendering'
      },
      computed: {
        combined () {
          return this.foo + this.bar
        }
      }
    })

    vm.foo = ''

    expect(vm.foo).toBe('')
    expect(vm.combined).toBe('rendering')
    expect(vm.__ob__).toBe(undefined)
  })
})
