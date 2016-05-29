import Vue from 'vue'

describe('Filters', () => {
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

  it('arguments', () => {
    const vm = new Vue({
      template: `<div>{{ msg | add(a, 3) }}</div>`,
      data: {
        msg: 1,
        a: 2
      },
      filters: {
        add: (v, arg1, arg2) => v + arg1 + arg2
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('6')
  })

  it('quotes', () => {
    const vm = new Vue({
      template: `<div>{{ msg + "b | c" + 'd' | upper }}</div>`,
      data: {
        msg: 'a'
      },
      filters: {
        upper: v => v.toUpperCase()
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('AB | CD')
  })

  it('double pipe', () => {
    const vm = new Vue({
      template: `<div>{{ b || msg | upper }}</div>`,
      data: {
        b: false,
        msg: 'a'
      },
      filters: {
        upper: v => v.toUpperCase()
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('A')
  })

  it('object literal', () => {
    const vm = new Vue({
      template: `<div>{{ { a: 123 } | pick('a') }}</div>`,
      filters: {
        pick: (v, key) => v[key]
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('123')
  })

  it('array literal', () => {
    const vm = new Vue({
      template: `<div>{{ [1, 2, 3] | reverse }}</div>`,
      filters: {
        reverse: arr => arr.reverse().join(',')
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('3,2,1')
  })
})
