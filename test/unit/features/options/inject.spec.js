import Vue from 'vue'
import { isNative } from 'core/util/env'

describe('Options provide/inject', () => {
  let injected
  const injectedComp = {
    inject: ['foo', 'bar'],
    render () {},
    created () {
      injected = [this.foo, this.bar]
    }
  }

  beforeEach(() => {
    injected = null
  })

  it('should work', () => {
    new Vue({
      template: `<child/>`,
      provide: {
        foo: 1,
        bar: false
      },
      components: {
        child: {
          template: `<injected-comp/>`,
          components: {
            injectedComp
          }
        }
      }
    }).$mount()

    expect(injected).toEqual([1, false])
  })

  it('should use closest parent', () => {
    new Vue({
      template: `<child/>`,
      provide: {
        foo: 1,
        bar: null
      },
      components: {
        child: {
          provide: {
            foo: 3
          },
          template: `<injected-comp/>`,
          components: {
            injectedComp
          }
        }
      }
    }).$mount()

    expect(injected).toEqual([3, null])
  })

  it('provide function', () => {
    new Vue({
      template: `<child/>`,
      data: {
        a: 1,
        b: false
      },
      provide () {
        return {
          foo: this.a,
          bar: this.b
        }
      },
      components: {
        child: {
          template: `<injected-comp/>`,
          components: {
            injectedComp
          }
        }
      }
    }).$mount()

    expect(injected).toEqual([1, false])
  })

  it('inject with alias', () => {
    const injectAlias = {
      inject: {
        baz: 'foo',
        qux: 'bar'
      },
      render () {},
      created () {
        injected = [this.baz, this.qux]
      }
    }

    new Vue({
      template: `<child/>`,
      provide: {
        foo: false,
        bar: 2
      },
      components: {
        child: {
          template: `<inject-alias/>`,
          components: {
            injectAlias
          }
        }
      }
    }).$mount()

    expect(injected).toEqual([false, 2])
  })

  it('self-inject', () => {
    const vm = new Vue({
      provide: {
        foo: 1
      },
      inject: ['foo']
    })

    expect(vm.foo).toBe(1)
  })

  if (typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys)) {
    it('with Symbol keys', () => {
      const s = Symbol()
      const vm = new Vue({
        template: `<child/>`,
        provide: {
          [s]: 123
        },
        components: {
          child: {
            inject: { s },
            template: `<div>{{ s }}</div>`
          }
        }
      }).$mount()
      expect(vm.$el.textContent).toBe('123')
    })
  }
})
