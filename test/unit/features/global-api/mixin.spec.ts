import Vue from 'vue'

describe('Global API: mixin', () => {
  let options
  beforeEach(() => {
    options = Vue.options
  })
  afterEach(() => {
    Vue.options = options
  })

  it('should work', () => {
    const spy = vi.fn()
    Vue.mixin({
      created() {
        spy(this.$options.myOption)
      }
    })
    new Vue({
      myOption: 'hello'
    })
    expect(spy).toHaveBeenCalledWith('hello')
  })

  it('should work for constructors created before mixin is applied', () => {
    const calls: any[] = []
    const Test: Vue = Vue.extend({
      name: 'test',
      beforeCreate() {
        calls.push(this.$options.myOption + ' local')
      }
    })
    Vue.mixin({
      beforeCreate() {
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

  // #4976
  it('should not drop late-attached custom options on existing constructors', () => {
    const baseSpy = vi.fn()
    const Base = Vue.extend({
      beforeCreate: baseSpy
    })

    const Test = Base.extend({})

    // Inject options later
    // vue-loader and vue-hot-reload-api are doing like this
    Test.options.computed = {
      $style: () => 123
    }

    const spy = vi.fn()
    Test.options.beforeCreate = Test.options.beforeCreate.concat(spy)

    // Update super constructor's options
    const mixinSpy = vi.fn()
    Vue.mixin({
      beforeCreate: mixinSpy
    })

    // mount the component
    const vm = new Test({
      template: '<div>{{ $style }}</div>'
    }).$mount()

    expect(spy.mock.calls.length).toBe(1)
    expect(baseSpy.mock.calls.length).toBe(1)
    expect(mixinSpy.mock.calls.length).toBe(1)
    expect(vm.$el.textContent).toBe('123')
    expect(vm.$style).toBe(123)

    // Should not be dropped
    expect(Test.options.computed.$style()).toBe(123)
    expect(Test.options.beforeCreate).toEqual([mixinSpy, baseSpy, spy])
  })

  // vue-class-component#83
  it('should work for a constructor mixin', () => {
    const spy = vi.fn()
    const Mixin = Vue.extend({
      created() {
        spy(this.$options.myOption)
      }
    })

    Vue.mixin(Mixin)

    new Vue({
      myOption: 'hello'
    })
    expect(spy).toHaveBeenCalledWith('hello')
  })

  // vue-class-component#87
  it('should not drop original lifecycle hooks', () => {
    const base = vi.fn()

    const Base = Vue.extend({
      beforeCreate: base
    })

    const injected = vi.fn()

    // inject a function
    Base.options.beforeCreate = Base.options.beforeCreate.concat(injected)

    Vue.mixin({})

    new Base({})

    expect(base).toHaveBeenCalled()
    expect(injected).toHaveBeenCalled()
  })

  // #8595
  it('chain call', () => {
    expect(Vue.mixin({})).toBe(Vue)
  })

  // #9198
  it('should not mix global mixin lifecycle hook twice', () => {
    const spy = vi.fn()
    Vue.mixin({
      created: spy
    })

    const mixin1 = Vue.extend({
      methods: {
        a() {}
      }
    })

    const mixin2 = Vue.extend({
      mixins: [mixin1]
    })

    const Child = Vue.extend({
      mixins: [mixin2]
    })

    const vm = new Child()

    expect(typeof vm.$options.methods.a).toBe('function')
    expect(spy.mock.calls.length).toBe(1)
  })
})
