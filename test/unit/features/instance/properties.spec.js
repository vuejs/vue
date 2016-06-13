import Vue from 'vue'

describe('Instance properties', () => {
  it('$data', () => {
    const data = { a: 1 }
    const vm = new Vue({
      data
    })
    expect(vm.a).toBe(1)
    expect(vm.$data).toBe(data)
    // vm -> data
    vm.a = 2
    expect(data.a).toBe(2)
    // data -> vm
    data.a = 3
    expect(vm.a).toBe(3)
  })

  it('$options', () => {
    const A = Vue.extend({
      methods: {
        a () {}
      }
    })
    const vm = new A({
      methods: {
        b () {}
      }
    })
    expect(typeof vm.$options.methods.a).toBe('function')
    expect(typeof vm.$options.methods.b).toBe('function')
  })

  it('$root/$children', done => {
    const vm = new Vue({
      template: '<div><test v-if="ok"></test></div>',
      data: { ok: true },
      components: {
        test: {
          template: '<div></div>'
        }
      }
    }).$mount()
    expect(vm.$root).toBe(vm)
    expect(vm.$children.length).toBe(1)
    expect(vm.$children[0].$root).toBe(vm)
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$children.length).toBe(0)
      vm.ok = true
    }).then(() => {
      expect(vm.$children.length).toBe(1)
      expect(vm.$children[0].$root).toBe(vm)
    }).then(done)
  })

  it('$isServer', () => {
    const vm = new Vue()
    expect(vm.$isServer).toBe(false)
    Vue.config._isServer = true
    expect(vm.$isServer).toBe(true)
    Vue.config._isServer = false
  })
})
