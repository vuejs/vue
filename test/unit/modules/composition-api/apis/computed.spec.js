const Vue = require('vue/dist/vue.common.js')
const { ref, computed, isReadonly } = require('../../src')

describe('Hooks computed', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('basic usage', (done) => {
    const vm = new Vue({
      template: '<div>{{ b }}</div>',
      setup() {
        const a = ref(1)
        const b = computed(() => a.value + 1)
        return {
          a,
          b,
        }
      },
    }).$mount()
    expect(vm.b).toBe(2)
    expect(vm.$el.textContent).toBe('2')
    vm.a = 2
    expect(vm.b).toBe(3)
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('3')
    }).then(done)
  })

  it('with setter', (done) => {
    const vm = new Vue({
      template: '<div>{{ b }}</div>',
      setup() {
        const a = ref(1)
        const b = computed({
          get: () => a.value + 1,
          set: (v) => (a.value = v - 1),
        })
        return {
          a,
          b,
        }
      },
    }).$mount()
    expect(vm.b).toBe(2)
    expect(vm.$el.textContent).toBe('2')
    vm.a = 2
    expect(vm.b).toBe(3)
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('3')
      vm.b = 1
      expect(vm.a).toBe(0)
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('1')
      })
      .then(done)
  })

  it('warn assigning to computed with no setter', () => {
    const vm = new Vue({
      setup() {
        const b = computed(() => 1)
        return {
          b,
        }
      },
    })
    vm.b = 2
    expect(warn.mock.calls[0][0]).toMatch(
      '[Vue warn]: Write operation failed: computed value is readonly.'
    )
  })

  it('watching computed', (done) => {
    const spy = jest.fn()
    const vm = new Vue({
      setup() {
        const a = ref(1)
        const b = computed(() => a.value + 1)
        return {
          a,
          b,
        }
      },
    })
    vm.$watch('b', spy)
    vm.a = 2
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith(3, 2)
    }).then(done)
  })

  it('caching', () => {
    const spy = jest.fn()
    const vm = new Vue({
      setup() {
        const a = ref(1)
        const b = computed(() => {
          spy()
          return a.value + 1
        })
        return {
          a,
          b,
        }
      },
    })
    expect(spy.mock.calls.length).toBe(0)
    vm.b
    expect(spy.mock.calls.length).toBe(1)
    vm.b
    expect(spy.mock.calls.length).toBe(1)
  })

  it('as component', (done) => {
    const Comp = Vue.extend({
      template: `<div>{{ b }} {{ c }}</div>`,
      setup() {
        const a = ref(1)
        const b = computed(() => {
          return a.value + 1
        })
        return {
          a,
          b,
        }
      },
    })

    const vm = new Comp({
      setup(_, { _vm }) {
        const c = computed(() => {
          return _vm.b + 1
        })

        return {
          c,
        }
      },
    }).$mount()
    expect(vm.b).toBe(2)
    expect(vm.c).toBe(3)
    expect(vm.$el.textContent).toBe('2 3')
    vm.a = 2
    expect(vm.b).toBe(3)
    expect(vm.c).toBe(4)
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('3 4')
    }).then(done)
  })

  it('rethrow computed error', () => {
    const vm = new Vue({
      setup() {
        const a = computed(() => {
          throw new Error('rethrow')
        })

        return {
          a,
        }
      },
    })
    expect(() => vm.a).toThrowError('rethrow')
  })

  it('Mixins should not break computed properties', () => {
    const ExampleComponent = Vue.extend({
      props: ['test'],
      render: (h) => h('div'),
      setup: (props) => ({ example: computed(() => props.test) }),
    })

    Vue.mixin({
      computed: {
        foobar() {
          return 'test'
        },
      },
    })

    const app = new Vue({
      render: (h) =>
        h('div', [
          h(ExampleComponent, { props: { test: 'A' } }),
          h(ExampleComponent, { props: { test: 'B' } }),
        ]),
    }).$mount()

    expect(app.$children[0].example).toBe('A')
    expect(app.$children[1].example).toBe('B')
  })

  it('should be readonly', () => {
    let a = { a: 1 }
    const x = computed(() => a)
    expect(isReadonly(x)).toBe(true)
    expect(isReadonly(x.value)).toBe(false)
    expect(isReadonly(x.value.a)).toBe(false)
    const z = computed({
      get() {
        return a
      },
      set(v) {
        a = v
      },
    })
    expect(isReadonly(z.value)).toBe(false)
    expect(isReadonly(z.value.a)).toBe(false)
  })
})
