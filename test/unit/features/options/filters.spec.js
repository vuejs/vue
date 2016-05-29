import Vue from 'vue'

describe('Options filters', () => {
  it('basic usage', () => {
    const vm = new Vue({
      template: '<div>{{ msg | upper }}</div>',
      data: {
        msg: 'hi'
      },
      filters: {
        upper: v => v.toUpperCase()
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('HI')
  })

  it('chained usage', () => {
    const vm = new Vue({
      template: '<div>{{ msg | upper | reverse }}</div>',
      data: {
        msg: 'hi'
      },
      filters: {
        upper: v => v.toUpperCase(),
        reverse: v => v.split('').reverse().join('')
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('IH')
  })
})
