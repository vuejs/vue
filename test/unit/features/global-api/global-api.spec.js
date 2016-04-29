import Vue from 'vue'

describe('Global API', () => {
  it('extend', () => {
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

  it('extend warn invalid names', () => {
    Vue.extend({ name: '123' })
    expect('Invalid component name: "123"').toHaveBeenWarned()
    Vue.extend({ name: '_fesf' })
    expect('Invalid component name: "_fesf"').toHaveBeenWarned()
    Vue.extend({ name: 'Some App' })
    expect('Invalid component name: "Some App"').toHaveBeenWarned()
  })

  it('Vue.extend works', () => {
    const foo = Vue.extend({
      template: '<span>foo</span>'
    })
    const bar = Vue.extend({
      template: '<span>bar</span>'
    })
    const vm = new Vue({
      el: document.createElement('div'),
      template: '<div><foo></foo><bar></bar></div>',
      components: { foo, bar }
    })
    expect(vm.$el.innerHTML).toBe('<span>foo</span><span>bar</span>')
  })

  it('global mixin', () => {
    const options = Vue.options
    const spy = jasmine.createSpy('global mixin')
    Vue.mixin({
      created: function () {
        spy(this.$options.myOption)
      }
    })
    new Vue({
      myOption: 'hello'
    })
    expect(spy).toHaveBeenCalledWith('hello')
    Vue.options = options
  })

  it('use', () => {
    const def = {}
    const options = {}
    const pluginStub = {
      install: (Vue, opts) => {
        Vue.directive('plugin-test', def)
        expect(opts).toBe(options)
      }
    }
    Vue.use(pluginStub, options)
    expect(Vue.options.directives['plugin-test']).toBe(def)
    delete Vue.options.directives['plugin-test']
    // use a function
    Vue.use(pluginStub.install, options)
    expect(Vue.options.directives['plugin-test']).toBe(def)
    delete Vue.options.directives['plugin-test']
  })

  it('compile', () => {
    const res = Vue.compile('<div><span>{{ msg }}</span></div>')
    const vm = new Vue({
      data: {
        msg: 'hello'
      },
      render: res.render,
      staticRenderFns: res.staticRenderFns
    })
    vm.$mount()
    expect(vm.$el.innerHTML).toContain('<span>hello</span>')
  })
})
