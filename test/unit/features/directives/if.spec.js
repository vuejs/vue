import Vue from 'vue'

describe('Directive v-if', () => {
  it('should check if value is truthy', () => {
    const vm = new Vue({
      template: '<div><span v-if="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>hello</span>')
  })

  it('should check if value is falsy', () => {
    const vm = new Vue({
      template: '<div><span v-if="foo">hello</span></div>',
      data: { foo: false }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('')
  })

  it('should update if value changed', done => {
    const vm = new Vue({
      template: '<div><span v-if="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>hello</span>')
    vm.foo = false
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('')
      vm.foo = {}
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>hello</span>')
      vm.foo = 0
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('')
      vm.foo = []
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>hello</span>')
      vm.foo = null
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('')
      vm.foo = '0'
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>hello</span>')
      vm.foo = undefined
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('')
      vm.foo = 1
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>hello</span>')
      done()
    })
    .catch(done)
  })

  it('should work well with v-else', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-if="foo">hello</span>
          <span v-else>bye</span>
        </div>
      `,
      data: { foo: true }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>hello</span>')
    vm.foo = false
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>bye</span>')
      vm.foo = {}
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>hello</span>')
      vm.foo = 0
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>bye</span>')
      vm.foo = []
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>hello</span>')
      vm.foo = null
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>bye</span>')
      vm.foo = '0'
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>hello</span>')
      vm.foo = undefined
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>bye</span>')
      vm.foo = 1
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>hello</span>')
      done()
    }).catch(done)
  })

  it('should work well with v-for', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="item,i in list" v-if="item.value">{{i}}</span>
        </div>
      `,
      data: {
        list: [
          { value: true },
          { value: false },
          { value: true }
        ]
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>0</span><span>2</span>')
    vm.list[0].value = false
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>2</span>')
      vm.list.push({ value: true })
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>2</span><span>3</span>')
      vm.list.splice(1, 2)
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>1</span>')
      done()
    }).catch(done)
  })

  it('should work well with v-for and v-else', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="item,i in list" v-if="item.value">hello</span>
          <span v-else>bye</span>
        </div>
      `,
      data: {
        list: [
          { value: true },
          { value: false },
          { value: true }
        ]
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>hello</span><span>bye</span><span>hello</span>')
    vm.list[0].value = false
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>bye</span><span>bye</span><span>hello</span>')
      vm.list.push({ value: true })
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>bye</span><span>bye</span><span>hello</span><span>hello</span>')
      vm.list.splice(1, 2)
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>bye</span><span>hello</span>')
      done()
    }).catch(done)
  })
})
