import Vue from 'vue'

describe('Directive v-ref', () => {
  const components = {
    test: {
      id: 'test'
    },
    test2: {
      id: 'test2'
    }
  }

  it('should accept hyphenated refs', () => {
    const vm = new Vue({
      template: `<div>
        <test v-ref:test></test>
        <test2 v-ref:test-hyphen></test2>
      </div>`,
      components
    })
    vm.$mount()
    expect(vm.$refs.test).toBeTruthy()
    expect(vm.$refs.test.$options.id).toBe('test')
    expect(vm.$refs['test-hyphen']).toBeTruthy()
    expect(vm.$refs['test-hyphen'].$options.id).toBe('test2')
  })

  it('should accept camelCase refs', () => {
    const vm = new Vue({
      template:
        `<div>
          <test v-ref:test></test>
          <test2 v-ref:testCase></test2>
        </div>`,
      components
    })
    vm.$mount()
    expect(vm.$refs.test).toBeTruthy()
    expect(vm.$refs.test.$options.id).toBe('test')
    expect(vm.$refs.testCase).toBeTruthy()
    expect(vm.$refs.testCase.$options.id).toBe('test2')
  })

  it('should accept HOC component', () => {
    const vm = new Vue({
      template: '<test v-ref:test></test>',
      components
    })
    vm.$mount()
    expect(vm.$refs.test).toBeTruthy()
    expect(vm.$refs.test.$options.id).toBe('test')
  })

  it('should accept dynamic component', done => {
    const vm = new Vue({
      template: `<div>
        <component :is="test" v-ref:test></component>
      </div>`,
      components,
      data: { test: 'test' }
    })
    vm.$mount()
    expect(vm.$refs.test.$options.id).toBe('test')
    vm.test = 'test2'
    waitForUpdate(() => {
      expect(vm.$refs.test.$options.id).toBe('test2')
      vm.test = ''
    }).then(() => {
      expect(vm.$refs.test).toBeUndefined()
    }).then(done)
  })
})
