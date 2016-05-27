import Vue from 'vue'

describe('Options template', () => {
  let el
  beforeEach(() => {
    el = document.createElement('script')
    el.type = 'x-template'
    el.id = 'app'
    el.innerHTML = '<p>{{message}}</p>'
    document.body.appendChild(el)
  })

  afterEach(() => {
    document.body.removeChild(el)
  })

  it('basic usage', () => {
    const vm = new Vue({
      template: '<div>{{message}}</div>',
      data: { message: 'hello world' }
    }).$mount()
    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.textContent).toBe(vm.message)
  })

  it('id reference', () => {
    const vm = new Vue({
      template: '#app',
      data: { message: 'hello world' }
    }).$mount()
    expect(vm.$el.tagName).toBe('P')
    expect(vm.$el.textContent).toBe(vm.message)
  })

  it('DOM element', () => {
    const elm = document.createElement('p')
    elm.innerHTML = '<p>{{message}}</p>'
    const vm = new Vue({
      template: elm,
      data: { message: 'hello world' }
    }).$mount()
    expect(vm.$el.tagName).toBe('P')
    expect(vm.$el.textContent).toBe(vm.message)
  })

  it('invalid template', () => {
    new Vue({
      template: Vue,
      data: { message: 'hello world' }
    }).$mount()
    expect('invalid template option').toHaveBeenWarned()
  })
})
