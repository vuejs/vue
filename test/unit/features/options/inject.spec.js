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

  it('inject before resolving data/props', () => {
    const vm = new Vue({
      provide: {
        foo: 1
      }
    })

    const child = new Vue({
      parent: vm,
      inject: ['foo'],
      data () {
        return {
          bar: this.foo + 1
        }
      },
      props: {
        baz: {
          default () {
            return this.foo + 2
          }
        }
      }
    })

    expect(child.foo).toBe(1)
    expect(child.bar).toBe(2)
    expect(child.baz).toBe(3)
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

  // Github issue #5223
  it('should work with reactive array', done => {
    const vm = new Vue({
      template: `<div><child></child></div>`,
      data () {
        return {
          foo: []
        }
      },
      provide () {
        return {
          foo: this.foo
        }
      },
      components: {
        child: {
          inject: ['foo'],
          template: `<span>{{foo.length}}</span>`
        }
      }
    }).$mount()

    expect(vm.$el.innerHTML).toEqual(`<span>0</span>`)
    vm.foo.push(vm.foo.length)
    vm.$nextTick(() => {
      expect(vm.$el.innerHTML).toEqual(`<span>1</span>`)
      vm.foo.pop()
      vm.$nextTick(() => {
        expect(vm.$el.innerHTML).toEqual(`<span>0</span>`)
        done()
      })
    })
  })

  it('should warn when injections has been modified', () => {
    const key = 'foo'
    const vm = new Vue({
      provide: {
        foo: 1
      }
    })

    const child = new Vue({
      parent: vm,
      inject: ['foo']
    })

    expect(child.foo).toBe(1)
    child.foo = 2
    expect(
      `Avoid mutating an injected value directly since the changes will be ` +
      `overwritten whenever the provided component re-renders. ` +
      `injection being mutated: "${key}"`).toHaveBeenWarned()
  })
})
