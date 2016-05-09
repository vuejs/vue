import Vue from 'vue'

describe('Directive v-html', () => {
  it('should render html', () => {
    const vm = new Vue({
      template: '<div v-html="a"></div>',
      data: { a: 'hello' }
    })
    vm.$mount()
    expect(vm.$el.innerHTML).toBe('hello')
  })

  it('should encode html entities', () => {
    const vm = new Vue({
      template: '<div v-html="a"></div>',
      data: { a: '<span></span>' }
    })
    vm.$mount()
    expect(vm.$el.innerHTML).toBe('<span></span>')
  })

  it('should support all value types', done => {
    const vm = new Vue({
      template: '<div v-html="a"></div>',
      data: { a: false }
    })
    vm.$mount()
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
