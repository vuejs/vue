import Vue from 'vue'

describe('Directive v-show', () => {
  it('should check show value is truthy', () => {
    const vm = new Vue({
      el: '#app',
      template: '<div><span v-show="foo">hello</span></div>',
      data: { foo: true }
    })
    expect(vm.$el.innerHTML).toMatch(/<span( style="")?>hello<\/span>/)
  })

  it('should check show value is falsy', () => {
    const vm = new Vue({
      el: '#app',
      template: '<div><span v-show="foo">hello</span></div>',
      data: { foo: false }
    })
    expect(vm.$el.innerHTML).toBe('<span style="display: none;">hello</span>')
  })

  it('should update show value changed', done => {
    const vm = new Vue({
      el: '#app',
      template: '<div><span v-show="foo">hello</span></div>',
      data: { foo: true }
    })
    expect(vm.$el.innerHTML).toMatch(/<span( style="")?>hello<\/span>/)
    vm.foo = false
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span style="display: none;">hello</span>')
      vm.foo = {}
    }).then(() => {
      expect(vm.$el.innerHTML).toMatch(/<span( style="")?>hello<\/span>/)
      vm.foo = 0
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span style="display: none;">hello</span>')
      vm.foo = []
    }).then(() => {
      expect(vm.$el.innerHTML).toMatch(/<span( style="")?>hello<\/span>/)
      vm.foo = null
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span style="display: none;">hello</span>')
      vm.foo = '0'
    }).then(() => {
      expect(vm.$el.innerHTML).toMatch(/<span( style="")?>hello<\/span>/)
      vm.foo = undefined
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span style="display: none;">hello</span>')
      vm.foo = 1
    }).then(() => {
      expect(vm.$el.innerHTML).toMatch(/<span( style="")?>hello<\/span>/)
      done()
    }).catch(done)
  })
})
