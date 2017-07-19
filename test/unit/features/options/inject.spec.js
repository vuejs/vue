import Vue from 'vue'
import { Observer } from 'core/observer/index'
import { isNative, isObject, hasOwn } from 'core/util/index'

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

  // Github issue #5194
  it('should work with functional', () => {
    new Vue({
      template: `<child/>`,
      provide: {
        foo: 1,
        bar: false
      },
      components: {
        child: {
          functional: true,
          inject: ['foo', 'bar'],
          render (h, context) {
            const { injections } = context
            injected = [injections.foo, injections.bar]
          }
        }
      }
    }).$mount()

    expect(injected).toEqual([1, false])
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

  it('should extend properly', () => {
    const parent = Vue.extend({
      template: `<span/>`,
      inject: ['foo']
    })

    const child = parent.extend({
      template: `<span/>`,
      inject: ['bar'],
      created () {
        injected = [this.foo, this.bar]
      }
    })

    new Vue({
      template: `<div><parent/><child/></div>`,
      provide: {
        foo: 1,
        bar: false
      },
      components: {
        parent,
        child
      }
    }).$mount()

    expect(injected).toEqual([1, false])
  })

  it('should merge from mixins properly (objects)', () => {
    const mixinA = { inject: { foo: 'foo' }}
    const mixinB = { inject: { bar: 'bar' }}
    const child = {
      mixins: [mixinA, mixinB],
      template: `<span/>`,
      created () {
        injected = [this.foo, this.bar]
      }
    }
    new Vue({
      provide: { foo: 'foo', bar: 'bar', baz: 'baz' },
      render (h) {
        return h(child)
      }
    }).$mount()

    expect(injected).toEqual(['foo', 'bar'])
  })

  it('should merge from mixins properly (arrays)', () => {
    const mixinA = { inject: ['foo'] }
    const mixinB = { inject: ['bar'] }
    const child = {
      mixins: [mixinA, mixinB],
      inject: ['baz'],
      template: `<span/>`,
      created () {
        injected = [this.foo, this.bar, this.baz]
      }
    }
    new Vue({
      provide: { foo: 'foo', bar: 'bar', baz: 'baz' },
      render (h) {
        return h(child)
      }
    }).$mount()

    expect(injected).toEqual(['foo', 'bar', 'baz'])
  })

  it('should merge from mixins properly (mix of objects and arrays)', () => {
    const mixinA = { inject: { foo: 'foo' }}
    const mixinB = { inject: ['bar'] }
    const child = {
      mixins: [mixinA, mixinB],
      inject: { qux: 'baz' },
      template: `<span/>`,
      created () {
        injected = [this.foo, this.bar, this.qux]
      }
    }
    new Vue({
      provide: { foo: 'foo', bar: 'bar', baz: 'baz' },
      render (h) {
        return h(child)
      }
    }).$mount()

    expect(injected).toEqual(['foo', 'bar', 'baz'])
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

  it('should warn when injections cannot be found', () => {
    const vm = new Vue({})
    new Vue({
      parent: vm,
      inject: ['foo', 'bar'],
      created () {}
    })
    expect(`Injection "foo" not found`).toHaveBeenWarned()
    expect(`Injection "bar" not found`).toHaveBeenWarned()
  })

  it('should not warn when injections can be found', () => {
    const vm = new Vue({
      provide: {
        foo: 1,
        bar: false,
        baz: undefined
      }
    })
    new Vue({
      parent: vm,
      inject: ['foo', 'bar', 'baz'],
      created () {}
    })
    expect(`Injection "foo" not found`).not.toHaveBeenWarned()
    expect(`Injection "bar" not found`).not.toHaveBeenWarned()
    expect(`Injection "baz" not found`).not.toHaveBeenWarned()
  })

  // Github issue #6008
  it('should merge provide from mixins (objects)', () => {
    const mixinA = { provide: { foo: 'foo' }}
    const mixinB = { provide: { bar: 'bar' }}
    const child = {
      inject: ['foo', 'bar'],
      template: `<span/>`,
      created () {
        injected = [this.foo, this.bar]
      }
    }
    new Vue({
      mixins: [mixinA, mixinB],
      render (h) {
        return h(child)
      }
    }).$mount()

    expect(injected).toEqual(['foo', 'bar'])
  })
  it('should merge provide from mixins (functions)', () => {
    const mixinA = { provide: () => ({ foo: 'foo' }) }
    const mixinB = { provide: () => ({ bar: 'bar' }) }
    const child = {
      inject: ['foo', 'bar'],
      template: `<span/>`,
      created () {
        injected = [this.foo, this.bar]
      }
    }
    new Vue({
      mixins: [mixinA, mixinB],
      render (h) {
        return h(child)
      }
    }).$mount()

    expect(injected).toEqual(['foo', 'bar'])
  })
  it('should merge provide from mixins (mix of objects and functions)', () => {
    const mixinA = { provide: { foo: 'foo' }}
    const mixinB = { provide: () => ({ bar: 'bar' }) }
    const mixinC = { provide: { baz: 'baz' }}
    const mixinD = { provide: () => ({ bam: 'bam' }) }
    const child = {
      inject: ['foo', 'bar', 'baz', 'bam'],
      template: `<span/>`,
      created () {
        injected = [this.foo, this.bar, this.baz, this.bam]
      }
    }
    new Vue({
      mixins: [mixinA, mixinB, mixinC, mixinD],
      render (h) {
        return h(child)
      }
    }).$mount()

    expect(injected).toEqual(['foo', 'bar', 'baz', 'bam'])
  })
  it('should merge provide from mixins and override existing keys', () => {
    const mixinA = { provide: { foo: 'foo' }}
    const mixinB = { provide: { foo: 'bar' }}
    const child = {
      inject: ['foo'],
      template: `<span/>`,
      created () {
        injected = [this.foo]
      }
    }
    new Vue({
      mixins: [mixinA, mixinB],
      render (h) {
        return h(child)
      }
    }).$mount()

    expect(injected).toEqual(['bar'])
  })
  it('should merge provide when Vue.extend', () => {
    const mixinA = { provide: () => ({ foo: 'foo' }) }
    const child = {
      inject: ['foo', 'bar'],
      template: `<span/>`,
      created () {
        injected = [this.foo, this.bar]
      }
    }
    const Ctor = Vue.extend({
      mixins: [mixinA],
      provide: { bar: 'bar' },
      render (h) {
        return h(child)
      }
    })

    new Ctor().$mount()

    expect(injected).toEqual(['foo', 'bar'])
  })

  // #5913
  it('should keep the reactive with provide', () => {
    function isObserver (obj) {
      if (isObject(obj)) {
        return hasOwn(obj, '__ob__') && obj.__ob__ instanceof Observer
      }
      return false
    }

    const vm = new Vue({
      template: `<div><child ref='child'></child></div>`,
      data () {
        return {
          foo: {},
          $foo: {},
          foo1: []
        }
      },
      provide () {
        return {
          foo: this.foo,
          $foo: this.$foo,
          foo1: this.foo1,
          bar: {},
          baz: []
        }
      },
      components: {
        child: {
          inject: ['foo', '$foo', 'foo1', 'bar', 'baz'],
          template: `<span/>`
        }
      }
    }).$mount()
    const child = vm.$refs.child
    expect(isObserver(child.foo)).toBe(true)
    expect(isObserver(child.$foo)).toBe(false)
    expect(isObserver(child.foo1)).toBe(true)
    expect(isObserver(child.bar)).toBe(false)
    expect(isObserver(child.baz)).toBe(false)
  })
})
