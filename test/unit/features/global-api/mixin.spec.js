import Vue from 'vue'

describe('Global API: mixin', () => {
  let options
  beforeEach(() => { options = Vue.options })
  afterEach(() => { Vue.options = options })

  it('should work', () => {
    const spy = jasmine.createSpy('global mixin')
    Vue.mixin({
      created () {
        spy(this.$options.myOption)
      }
    })
    new Vue({
      myOption: 'hello'
    })
    expect(spy).toHaveBeenCalledWith('hello')
  })

  it('should work for constructors created before mixin is applied', () => {
    const calls = []
    const Test = Vue.extend({
      name: 'test',
      beforeCreate () {
        calls.push(this.$options.myOption + ' local')
      }
    })
    Vue.mixin({
      beforeCreate () {
        calls.push(this.$options.myOption + ' global')
      }
    })
    expect(Test.options.name).toBe('test')
    new Test({
      myOption: 'hello'
    })
    expect(calls).toEqual(['hello global', 'hello local'])
  })

  // #3957
  it('should work for global props', () => {
    const Test = Vue.extend({
      template: `<div>{{ prop }}</div>`
    })

    Vue.mixin({
      props: ['prop']
    })

    // test child component
    const vm = new Vue({
      template: '<test prop="hi"></test>',
      components: { Test }
    }).$mount()

    expect(vm.$el.textContent).toBe('hi')
  })

  // vue-loader#433
  it('should not drop late-set render functions', () => {
    const Test = Vue.extend({})
    Test.options.render = h => h('div', 'hello')

    Vue.mixin({})

    const vm = new Vue({
      render: h => h(Test)
    }).$mount()

    expect(vm.$el.textContent).toBe('hello')
  })

  // #4266
  it('should not drop scopedId', () => {
    const Test = Vue.extend({})
    Test.options._scopeId = 'foo'

    Vue.mixin({})

    const vm = new Test({
      template: '<div><p>hi</p></div>'
    }).$mount()

    expect(vm.$el.children[0].hasAttribute('foo')).toBe(true)
  })
})
