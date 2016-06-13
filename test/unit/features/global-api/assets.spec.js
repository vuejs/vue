import Vue from 'vue'

describe('Global API: assets', () => {
  const Test = Vue.extend()

  it('directive / transition / filters', () => {
    const assets = ['directive', 'transition', 'filter']
    assets.forEach(function (type) {
      const def = {}
      Test[type]('test', def)
      expect(Test.options[type + 's'].test).toBe(def)
      expect(Test[type]('test')).toBe(def)
      // extended registration should not pollute global
      expect(Vue.options[type + 's'].test).toBeUndefined()
    })
  })

  describe('Vue.component', () => {
    it('should register a component', () => {
      Vue.component('foo', {
        template: '<span>foo</span>'
      })
      Vue.component('bar', {
        template: '<span>bar</span>'
      })
      const vm = new Vue({
        template: '<div><foo></foo><bar></bar></div>'
      }).$mount()
      expect(vm.$el.innerHTML).toBe('<span>foo</span><span>bar</span>')
      // unregister them
      delete Vue.options.components.foo
      delete Vue.options.components.bar
    })
  })

  it('component on extended constructor', () => {
    const def = { a: 1 }
    Test.component('test', def)
    const component = Test.options.components.test
    expect(typeof component).toBe('function')
    expect(component.super).toBe(Vue)
    expect(component.options.a).toBe(1)
    expect(component.options.name).toBe('test')
    expect(Test.component('test')).toBe(component)
    // already extended
    Test.component('test2', component)
    expect(Test.component('test2')).toBe(component)
    // extended registration should not pollute global
    expect(Vue.options.components.test).toBeUndefined()
  })
})
