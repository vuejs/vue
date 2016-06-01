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

  it('should register as Array when used with v-for', done => {
    const vm = new Vue({
      data: {
        items: [1, 2, 3]
      },
      template: `
        <div>
          <div v-for="n in items" v-ref:list>{{n}}</div>
        </div>
      `
    }).$mount()
    assertRefs()
    // updating
    vm.items.push(4)
    waitForUpdate(assertRefs)
      .then(() => { vm.items = [] })
      .then(assertRefs)
      .then(done)

    function assertRefs () {
      expect(Array.isArray(vm.$refs.list)).toBe(true)
      expect(vm.$refs.list.length).toBe(vm.items.length)
      expect(vm.$refs.list.every((item, i) => item.textContent === String(i + 1))).toBe(true)
    }
  })

  it('should register as Array when used with v-for (components)', done => {
    const vm = new Vue({
      data: {
        items: [1, 2, 3]
      },
      template: `
        <div>
          <test v-for="n in items" v-ref:list :n="n"></test>
        </div>
      `,
      components: {
        test: {
          props: ['n'],
          template: '<div>{{ n }}</div>'
        }
      }
    }).$mount()
    assertRefs()
    // updating
    vm.items.push(4)
    waitForUpdate(assertRefs)
      .then(() => { vm.items = [] })
      .then(assertRefs)
      .then(done)

    function assertRefs () {
      expect(Array.isArray(vm.$refs.list)).toBe(true)
      expect(vm.$refs.list.length).toBe(vm.items.length)
      expect(vm.$refs.list.every((comp, i) => comp.$el.textContent === String(i + 1))).toBe(true)
    }
  })
})
