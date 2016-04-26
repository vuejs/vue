import Vue from 'vue'

describe('Directive v-text', () => {
  it('should render text', () => {
    const vm = new Vue({
      el: '#app',
      template: '<div v-text="a"></div>',
      data: { a: 'hello' }
    })
    expect(vm.$el.innerHTML).toBe('hello')
  })

  it('should encode html entities', () => {
    const vm = new Vue({
      el: '#app',
      template: '<div v-text="a"></div>',
      data: { a: '<foo>' }
    })
    expect(vm.$el.innerHTML).toBe('&lt;foo&gt;')
  })

  it('should support all value types', done => {
    const vm = new Vue({
      el: '#app',
      template: '<div v-text="a"></div>',
      data: { a: false }
    })
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('false')
      vm.a = []
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('[]')
      vm.a = {}
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('{}')
      vm.a = 123
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('123')
      vm.a = 0
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('0')
      vm.a = ' '
    }).then(() => {
      expect(vm.$el.innerHTML).toBe(' ')
      vm.a = '    '
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('    ')
      vm.a = null
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('')
      vm.a = undefined
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('')
      done()
    }).catch(done)
  })
})
