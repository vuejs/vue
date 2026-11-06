import Vue from 'vue'
import {
  h,
  provide,
  inject,
  InjectionKey,
  ref,
  nextTick,
  Ref,
  readonly,
  reactive
} from 'v3/index'

// reference: https://vue-composition-api-rfc.netlify.com/api.html#provide-inject
describe('api: provide/inject', () => {
  it('string keys', () => {
    const Provider = {
      setup() {
        provide('foo', 1)
        return () => h(Middle)
      }
    }

    const Middle = {
      render: () => h(Consumer)
    }

    const Consumer = {
      setup() {
        const foo = inject('foo')
        return () => h('div', foo)
      }
    }

    const vm = new Vue(Provider).$mount()
    expect(vm.$el.outerHTML).toBe(`<div>1</div>`)
  })

  it('symbol keys', () => {
    // also verifies InjectionKey type sync
    const key: InjectionKey<number> = Symbol()

    const Provider = {
      setup() {
        provide(key, 1)
        return () => h(Middle)
      }
    }

    const Middle = {
      render: () => h(Consumer)
    }

    const Consumer = {
      setup() {
        const foo = inject(key) || 1
        return () => h('div', foo + 1)
      }
    }

    const vm = new Vue(Provider).$mount()
    expect(vm.$el.outerHTML).toBe(`<div>2</div>`)
  })

  it('default values', () => {
    const Provider = {
      setup() {
        provide('foo', 'foo')
        return () => h(Middle)
      }
    }

    const Middle = {
      render: () => h(Consumer)
    }

    const Consumer = {
      setup() {
        // default value should be ignored if value is provided
        const foo = inject('foo', 'fooDefault')
        // default value should be used if value is not provided
        const bar = inject('bar', 'bar')
        return () => h('div', foo + bar)
      }
    }

    const vm = new Vue(Provider).$mount()
    expect(vm.$el.outerHTML).toBe(`<div>foobar</div>`)
  })

  it('bound to instance', () => {
    const Provider = {
      setup() {
        return () => h(Consumer)
      }
    }

    const Consumer = {
      name: 'Consumer',
      inject: {
        foo: {
          from: 'foo',
          default() {
            return this!.$options.name
          }
        }
      },
      render() {
        // @ts-ignore
        return h('div', this.foo)
      }
    }

    const vm = new Vue(Provider).$mount()
    expect(vm.$el.outerHTML).toBe(`<div>Consumer</div>`)
  })

  it('nested providers', () => {
    const ProviderOne = {
      setup() {
        provide('foo', 'foo')
        provide('bar', 'bar')
        return () => h(ProviderTwo)
      }
    }

    const ProviderTwo = {
      setup() {
        // override parent value
        provide('foo', 'fooOverride')
        provide('baz', 'baz')
        return () => h(Consumer)
      }
    }

    const Consumer = {
      setup() {
        const foo = inject('foo')
        const bar = inject('bar')
        const baz = inject('baz')
        return () => h('div', [foo, bar, baz].join(','))
      }
    }

    const vm = new Vue(ProviderOne).$mount()
    expect(vm.$el.outerHTML).toBe(`<div>fooOverride,bar,baz</div>`)
  })

  it('reactivity with refs', async () => {
    const count = ref(1)

    const Provider = {
      setup() {
        provide('count', count)
        return () => h(Middle)
      }
    }

    const Middle = {
      render: () => h(Consumer)
    }

    const Consumer = {
      setup() {
        const count = inject<Ref<number>>('count')!
        return () => h('div', count.value)
      }
    }

    const vm = new Vue(Provider).$mount()
    expect(vm.$el.outerHTML).toBe(`<div>1</div>`)

    count.value++
    await nextTick()
    expect(vm.$el.outerHTML).toBe(`<div>2</div>`)
  })

  it('reactivity with readonly refs', async () => {
    const count = ref(1)

    const Provider = {
      setup() {
        provide('count', readonly(count))
        return () => h(Middle)
      }
    }

    const Middle = {
      render: () => h(Consumer)
    }

    const Consumer = {
      setup() {
        const count = inject<Ref<number>>('count')!
        // should not work
        count.value++
        return () => h('div', count.value)
      }
    }

    const vm = new Vue(Provider).$mount()
    expect(vm.$el.outerHTML).toBe(`<div>1</div>`)

    expect(
      `Set operation on key "value" failed: target is readonly`
    ).toHaveBeenWarned()

    // source mutation should still work
    count.value++
    await nextTick()
    expect(vm.$el.outerHTML).toBe(`<div>2</div>`)
  })

  it('reactivity with objects', async () => {
    const rootState = reactive({ count: 1 })

    const Provider = {
      setup() {
        provide('state', rootState)
        return () => h(Middle)
      }
    }

    const Middle = {
      render: () => h(Consumer)
    }

    const Consumer = {
      setup() {
        const state = inject<typeof rootState>('state')!
        return () => h('div', state.count)
      }
    }

    const vm = new Vue(Provider).$mount()
    expect(vm.$el.outerHTML).toBe(`<div>1</div>`)

    rootState.count++
    await nextTick()
    expect(vm.$el.outerHTML).toBe(`<div>2</div>`)
  })

  it('reactivity with readonly objects', async () => {
    const rootState = reactive({ count: 1 })

    const Provider = {
      setup() {
        provide('state', readonly(rootState))
        return () => h(Middle)
      }
    }

    const Middle = {
      render: () => h(Consumer)
    }

    const Consumer = {
      setup() {
        const state = inject<typeof rootState>('state')!
        // should not work
        state.count++
        return () => h('div', state.count)
      }
    }

    const vm = new Vue(Provider).$mount()
    expect(vm.$el.outerHTML).toBe(`<div>1</div>`)

    expect(
      `Set operation on key "count" failed: target is readonly`
    ).toHaveBeenWarned()

    rootState.count++
    await nextTick()
    expect(vm.$el.outerHTML).toBe(`<div>2</div>`)
  })

  it('should warn unfound', () => {
    const Provider = {
      setup() {
        return () => h(Middle)
      }
    }

    const Middle = {
      render: () => h(Consumer)
    }

    const Consumer = {
      setup() {
        const foo = inject('foo')
        expect(foo).toBeUndefined()
        return () => h('div', foo)
      }
    }

    const vm = new Vue(Provider).$mount()
    expect(vm.$el.outerHTML).toBe(`<div></div>`)
    expect(`injection "foo" not found.`).toHaveBeenWarned()
  })

  it('should not warn when default value is undefined', () => {
    const Provider = {
      setup() {
        return () => h(Middle)
      }
    }

    const Middle = {
      render: () => h(Consumer)
    }

    const Consumer = {
      setup() {
        const foo = inject('foo', undefined)
        return () => h('div', foo)
      }
    }

    new Vue(Provider).$mount()
    expect(`injection "foo" not found.`).not.toHaveBeenWarned()
  })

  // #2400
  it('should not self-inject', () => {
    const Comp = {
      setup() {
        provide('foo', 'foo')
        const injection = inject('foo', null)
        return () => h('div', injection)
      }
    }

    expect(new Vue(Comp).$mount().$el.outerHTML).toBe(`<div></div>`)
  })
})
