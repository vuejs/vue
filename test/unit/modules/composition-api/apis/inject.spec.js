const Vue = require('vue/dist/vue.common.js')
const { inject, provide, ref, reactive } = require('../../src')

let injected
const injectedComp = {
  render() {},
  setup() {
    return {
      foo: inject('foo'),
      bar: inject('bar'),
    }
  },
  created() {
    injected = [this.foo, this.bar]
  },
}

beforeEach(() => {
  injected = null
})

describe('Hooks provide/inject', () => {
  beforeEach(() => {
    warn = jest.spyOn(global.console, 'error').mockImplementation(() => null)
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('should work', () => {
    new Vue({
      template: `<child/>`,
      setup() {
        const count = ref(1)
        provide('foo', count)
        provide('bar', false)
      },
      components: {
        child: {
          template: `<injected-comp/>`,
          components: {
            injectedComp,
          },
        },
      },
    }).$mount()

    expect(injected).toEqual([1, false])
  })

  it('should return a default value when inject not found', () => {
    let injected
    new Vue({
      template: `<child/>`,
      components: {
        child: {
          template: `<div>{{ msg }}</div>`,
          setup() {
            injected = inject('not-existed-inject-key', 'foo')
            return {
              injected,
            }
          },
        },
      },
    }).$mount()

    expect(injected).toBe('foo')
  })

  it('should work for ref value', (done) => {
    const Msg = Symbol()
    const app = new Vue({
      template: `<child/>`,
      setup() {
        provide(Msg, ref('hello'))
      },
      components: {
        child: {
          template: `<div>{{ msg }}</div>`,
          setup() {
            return {
              msg: inject(Msg),
            }
          },
        },
      },
    }).$mount()

    app.$children[0].msg = 'bar'
    waitForUpdate(() => {
      expect(app.$el.textContent).toBe('bar')
    }).then(done)
  })

  it('should work for reactive value', (done) => {
    const State = Symbol()
    let obj
    const app = new Vue({
      template: `<child/>`,
      setup() {
        provide(State, reactive({ msg: 'foo' }))
      },
      components: {
        child: {
          template: `<div>{{ state.msg }}</div>`,
          setup() {
            obj = inject(State)
            return {
              state: obj,
            }
          },
        },
      },
    }).$mount()
    expect(obj.msg).toBe('foo')
    app.$children[0].state.msg = 'bar'
    waitForUpdate(() => {
      expect(app.$el.textContent).toBe('bar')
    }).then(done)
  })

  it('should work when combined with 2.x provide option', () => {
    const State = Symbol()
    let obj1
    let obj2
    new Vue({
      template: `<child/>`,
      setup() {
        provide(State, { msg: 'foo' })
      },
      provide: {
        X: { msg: 'bar' },
      },
      components: {
        child: {
          setup() {
            obj1 = inject(State)
            obj2 = inject('X')
          },
          template: `<div/>`,
        },
      },
    }).$mount()
    expect(obj1.msg).toBe('foo')
    expect(obj2.msg).toBe('bar')
  })

  it('should call default value as factory', () => {
    const State = Symbol()
    let fn = jest.fn()
    new Vue({
      template: `<child/>`,
      setup() {},
      provide: {
        X: { msg: 'bar' },
      },
      components: {
        child: {
          setup() {
            inject(State, fn, true)
          },
          template: `<div/>`,
        },
      },
    }).$mount()
    expect(fn).toHaveBeenCalled()
  })
})
