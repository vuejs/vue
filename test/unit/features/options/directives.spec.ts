import { SpyInstanceFn } from 'vitest'
import Vue from 'vue'

describe('Options directives', () => {
  it('basic usage', done => {
    const bindSpy = vi.fn()
    const insertedSpy = vi.fn()
    const updateSpy = vi.fn()
    const componentUpdatedSpy = vi.fn()
    const unbindSpy = vi.fn()

    const assertContext = (el, binding, vnode) => {
      expect(vnode.context).toBe(vm)
      expect(binding.arg).toBe('arg')
      expect(binding.modifiers).toEqual({ hello: true })
    }

    const vm = new Vue({
      template:
        '<div class="hi"><div v-if="ok" v-test:arg.hello="a">{{ msg }}</div></div>',
      data: {
        msg: 'hi',
        a: 'foo',
        ok: true
      },
      directives: {
        test: {
          bind(el, binding, vnode) {
            bindSpy()
            assertContext(el, binding, vnode)
            expect(binding.value).toBe('foo')
            expect(binding.expression).toBe('a')
            expect(binding.oldValue).toBeUndefined()
            expect(el.parentNode).toBeNull()
          },
          inserted(el, binding, vnode) {
            insertedSpy()
            assertContext(el, binding, vnode)
            expect(binding.value).toBe('foo')
            expect(binding.expression).toBe('a')
            expect(binding.oldValue).toBeUndefined()
            expect(el.parentNode.className).toBe('hi')
          },
          update(el, binding, vnode, oldVnode) {
            updateSpy()
            assertContext(el, binding, vnode)
            expect(el).toBe(vm.$el.children[0])
            expect(oldVnode).not.toBe(vnode)
            expect(binding.expression).toBe('a')
            if (binding.value !== binding.oldValue) {
              expect(binding.value).toBe('bar')
              expect(binding.oldValue).toBe('foo')
            }
          },
          componentUpdated(el, binding, vnode) {
            componentUpdatedSpy()
            assertContext(el, binding, vnode)
          },
          unbind(el, binding, vnode) {
            unbindSpy()
            assertContext(el, binding, vnode)
          }
        }
      }
    })

    vm.$mount()
    expect(bindSpy).toHaveBeenCalled()
    expect(insertedSpy).toHaveBeenCalled()
    expect(updateSpy).not.toHaveBeenCalled()
    expect(componentUpdatedSpy).not.toHaveBeenCalled()
    expect(unbindSpy).not.toHaveBeenCalled()
    vm.a = 'bar'
    waitForUpdate(() => {
      expect(updateSpy).toHaveBeenCalled()
      expect(componentUpdatedSpy).toHaveBeenCalled()
      expect(unbindSpy).not.toHaveBeenCalled()
      vm.msg = 'bye'
    })
      .then(() => {
        expect(componentUpdatedSpy.mock.calls.length).toBe(2)
        vm.ok = false
      })
      .then(() => {
        expect(unbindSpy).toHaveBeenCalled()
      })
      .then(done)
  })

  it('function shorthand', done => {
    const spy = vi.fn()
    const vm = new Vue({
      template: '<div v-test:arg.hello="a"></div>',
      data: { a: 'foo' },
      directives: {
        test(el, binding, vnode) {
          expect(vnode.context).toBe(vm)
          expect(binding.arg).toBe('arg')
          expect(binding.modifiers).toEqual({ hello: true })
          spy(binding.value, binding.oldValue)
        }
      }
    })
    vm.$mount()
    expect(spy).toHaveBeenCalledWith('foo', undefined)
    vm.a = 'bar'
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith('bar', 'foo')
    }).then(done)
  })

  it('function shorthand (global)', done => {
    const spy = vi.fn()
    Vue.directive('test', function (el, binding, vnode) {
      expect(vnode.context).toBe(vm)
      expect(binding.arg).toBe('arg')
      expect(binding.modifiers).toEqual({ hello: true })
      spy(binding.value, binding.oldValue)
    })
    const vm = new Vue({
      template: '<div v-test:arg.hello="a"></div>',
      data: { a: 'foo' }
    })
    vm.$mount()
    expect(spy).toHaveBeenCalledWith('foo', undefined)
    vm.a = 'bar'
    waitForUpdate(() => {
      expect(spy).toHaveBeenCalledWith('bar', 'foo')
      delete Vue.options.directives.test
    }).then(done)
  })

  it('should teardown directives on old vnodes when new vnodes have none', done => {
    const vm = new Vue({
      data: {
        ok: true
      },
      template: `
        <div>
          <div v-if="ok" v-test>a</div>
          <div v-else class="b">b</div>
        </div>
      `,
      directives: {
        test: {
          bind: el => {
            el.id = 'a'
          },
          unbind: el => {
            el.id = ''
          }
        }
      }
    }).$mount()
    expect(vm.$el.children[0].id).toBe('a')
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$el.children[0].id).toBe('')
      expect(vm.$el.children[0].className).toBe('b')
    }).then(done)
  })

  it('should properly handle same node with different directive sets', done => {
    const spies: Record<string, SpyInstanceFn> = {}
    const createSpy = name => (spies[name] = vi.fn())
    const vm = new Vue({
      data: {
        ok: true,
        val: 123
      },
      template: `
        <div>
          <div v-if="ok" v-test="val" v-test.hi="val"></div>
          <div v-if="!ok" v-test.hi="val" v-test2="val"></div>
        </div>
      `,
      directives: {
        test: {
          bind: createSpy('bind1'),
          inserted: createSpy('inserted1'),
          update: createSpy('update1'),
          componentUpdated: createSpy('componentUpdated1'),
          unbind: createSpy('unbind1')
        },
        test2: {
          bind: createSpy('bind2'),
          inserted: createSpy('inserted2'),
          update: createSpy('update2'),
          componentUpdated: createSpy('componentUpdated2'),
          unbind: createSpy('unbind2')
        }
      }
    }).$mount()

    expect(spies.bind1.mock.calls.length).toBe(2)
    expect(spies.inserted1.mock.calls.length).toBe(2)
    expect(spies.bind2.mock.calls.length).toBe(0)
    expect(spies.inserted2.mock.calls.length).toBe(0)

    vm.ok = false
    waitForUpdate(() => {
      // v-test with modifier should be updated
      expect(spies.update1.mock.calls.length).toBe(1)
      expect(spies.componentUpdated1.mock.calls.length).toBe(1)

      // v-test without modifier should be unbound
      expect(spies.unbind1.mock.calls.length).toBe(1)

      // v-test2 should be bound
      expect(spies.bind2.mock.calls.length).toBe(1)
      expect(spies.inserted2.mock.calls.length).toBe(1)

      vm.ok = true
    })
      .then(() => {
        // v-test without modifier should be bound again
        expect(spies.bind1.mock.calls.length).toBe(3)
        expect(spies.inserted1.mock.calls.length).toBe(3)

        // v-test2 should be unbound
        expect(spies.unbind2.mock.calls.length).toBe(1)

        // v-test with modifier should be updated again
        expect(spies.update1.mock.calls.length).toBe(2)
        expect(spies.componentUpdated1.mock.calls.length).toBe(2)

        vm.val = 234
      })
      .then(() => {
        expect(spies.update1.mock.calls.length).toBe(4)
        expect(spies.componentUpdated1.mock.calls.length).toBe(4)
      })
      .then(done)
  })

  it('warn non-existent', () => {
    new Vue({
      template: '<div v-test></div>'
    }).$mount()
    expect('Failed to resolve directive: test').toHaveBeenWarned()
  })

  // #6513
  it('should invoke unbind & inserted on inner component root element change', done => {
    const dir = {
      bind: vi.fn(),
      inserted: vi.fn(),
      unbind: vi.fn()
    }

    const Child = {
      template: `<div v-if="ok"/><span v-else/>`,
      data: () => ({ ok: true })
    }

    const vm = new Vue({
      template: `<child ref="child" v-test />`,
      directives: { test: dir },
      components: { Child }
    }).$mount()

    const oldEl = vm.$el
    expect(dir.bind.mock.calls.length).toBe(1)
    expect(dir.bind.mock.calls[0][0]).toBe(oldEl)
    expect(dir.inserted.mock.calls.length).toBe(1)
    expect(dir.inserted.mock.calls[0][0]).toBe(oldEl)
    expect(dir.unbind).not.toHaveBeenCalled()

    vm.$refs.child.ok = false
    waitForUpdate(() => {
      expect(vm.$el.tagName).toBe('SPAN')
      expect(dir.bind.mock.calls.length).toBe(2)
      expect(dir.bind.mock.calls[1][0]).toBe(vm.$el)
      expect(dir.inserted.mock.calls.length).toBe(2)
      expect(dir.inserted.mock.calls[1][0]).toBe(vm.$el)
      expect(dir.unbind.mock.calls.length).toBe(1)
      expect(dir.unbind.mock.calls[0][0]).toBe(oldEl)
    }).then(done)
  })

  it('dynamic arguments', done => {
    const vm = new Vue({
      template: `<div v-my:[key]="1"/>`,
      data: {
        key: 'foo'
      },
      directives: {
        my: {
          bind(el, binding) {
            expect(binding.arg).toBe('foo')
          },
          update(el, binding) {
            expect(binding.arg).toBe('bar')
            expect(binding.oldArg).toBe('foo')
            done()
          }
        }
      }
    }).$mount()
    vm.key = 'bar'
  })

  it('deep object like `deep.a` as dynamic arguments', done => {
    const vm = new Vue({
      template: `<div v-my:[deep.a]="1"/>`,
      data: {
        deep: {
          a: 'foo'
        }
      },
      directives: {
        my: {
          bind(el, binding) {
            expect(binding.arg).toBe('foo')
          },
          update(el, binding) {
            expect(binding.arg).toBe('bar')
            expect(binding.oldArg).toBe('foo')
            done()
          }
        }
      }
    }).$mount()
    vm.deep.a = 'bar'
  })

  it('deep object like `deep.a.b` as dynamic arguments', done => {
    const vm = new Vue({
      template: `<div v-my:[deep.a.b]="1"/>`,
      data: {
        deep: {
          a: {
            b: 'foo'
          }
        }
      },
      directives: {
        my: {
          bind(el, binding) {
            expect(binding.arg).toBe('foo')
          },
          update(el, binding) {
            expect(binding.arg).toBe('bar')
            expect(binding.oldArg).toBe('foo')
            done()
          }
        }
      }
    }).$mount()
    vm.deep.a.b = 'bar'
  })

  it('deep object as dynamic arguments with modifiers', done => {
    const vm = new Vue({
      template: `<div v-my:[deep.a.b].x.y="1"/>`,
      data: {
        deep: {
          a: {
            b: 'foo'
          }
        }
      },
      directives: {
        my: {
          bind(el, binding) {
            expect(binding.arg).toBe('foo')
            expect(binding.modifiers.x).toBe(true)
            expect(binding.modifiers.y).toBe(true)
          },
          update(el, binding) {
            expect(binding.arg).toBe('bar')
            expect(binding.oldArg).toBe('foo')
            done()
          }
        }
      }
    }).$mount()
    vm.deep.a.b = 'bar'
  })
})
