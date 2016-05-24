import Vue from 'vue'

describe('Global API: extend', () => {
  it('should correctly merge options', () => {
    const Test = Vue.extend({
      name: 'test',
      a: 1,
      b: 2
    })
    expect(Test.options.a).toBe(1)
    expect(Test.options.b).toBe(2)
    expect(Test.super).toBe(Vue)
    const t = new Test({
      a: 2
    })
    expect(t.$options.a).toBe(2)
    expect(t.$options.b).toBe(2)
    // inheritance
    const Test2 = Test.extend({
      a: 2
    })
    expect(Test2.options.a).toBe(2)
    expect(Test2.options.b).toBe(2)
    const t2 = new Test2({
      a: 3
    })
    expect(t2.$options.a).toBe(3)
    expect(t2.$options.b).toBe(2)
  })

  it('should warn invalid names', () => {
    Vue.extend({ name: '123' })
    expect('Invalid component name: "123"').toHaveBeenWarned()
    Vue.extend({ name: '_fesf' })
    expect('Invalid component name: "_fesf"').toHaveBeenWarned()
    Vue.extend({ name: 'Some App' })
    expect('Invalid component name: "Some App"').toHaveBeenWarned()
  })

  it('should work when used as components', () => {
    const foo = Vue.extend({
      template: '<span>foo</span>'
    })
    const bar = Vue.extend({
      template: '<span>bar</span>'
    })
    const vm = new Vue({
      template: '<div><foo></foo><bar></bar></div>',
      components: { foo, bar }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>foo</span><span>bar</span>')
  })
})
