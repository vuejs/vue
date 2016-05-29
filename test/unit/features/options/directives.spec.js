import Vue from 'vue'

describe('Options directives', () => {
  it('basic usage', done => {
    const bindSpy = jasmine.createSpy('bind')
    const updateSpy = jasmine.createSpy('update')
    const postupdateSpy = jasmine.createSpy('postupdate')
    const unbindSpy = jasmine.createSpy('unbind')

    const assertContext = (el, binding, vnode) => {
      expect(vnode.context).toBe(vm)
      expect(binding.arg).toBe('arg')
      expect(binding.modifiers).toEqual({ hello: true })
    }

    const vm = new Vue({
      template: '<div v-if="ok" v-test:arg.hello="a">{{ msg }}</div>',
      data: {
        msg: 'hi',
        a: 'foo',
        ok: true
      },
      directives: {
        test: {
          bind (el, binding, vnode) {
            bindSpy()
            assertContext(el, binding, vnode)
            expect(binding.value).toBe('foo')
            expect(binding.oldValue).toBeUndefined()
          },
          update (el, binding, vnode, oldVnode) {
            updateSpy()
            assertContext(el, binding, vnode)
            expect(el).toBe(vm.$el)
            expect(oldVnode).toBe(vm._vnode)
            expect(oldVnode).not.toBe(vnode)
            expect(binding.value).toBe('bar')
            expect(binding.oldValue).toBe('foo')
          },
          postupdate (el, binding, vnode) {
            postupdateSpy()
            assertContext(el, binding, vnode)
          },
          unbind (el, binding, vnode) {
            unbindSpy()
            assertContext(el, binding, vnode)
          }
        }
      }
    })

    vm.$mount()
    expect(bindSpy).toHaveBeenCalled()
    expect(updateSpy).not.toHaveBeenCalled()
    expect(postupdateSpy).not.toHaveBeenCalled()
    expect(unbindSpy).not.toHaveBeenCalled()
    vm.a = 'bar'
    waitForUpdate(() => {
      expect(updateSpy).toHaveBeenCalled()
      expect(postupdateSpy).toHaveBeenCalled()
      expect(unbindSpy).not.toHaveBeenCalled()
      vm.msg = 'bye'
    }).then(() => {
      expect(postupdateSpy.calls.count()).toBe(2)
      vm.ok = false
    }).then(() => {
      expect(unbindSpy).toHaveBeenCalled()
    }).then(done)
  })

  it('function shorthand', done => {
    const spy = jasmine.createSpy('directive')
    const vm = new Vue({
      template: '<div v-test:arg.hello="a"></div>',
      data: { a: 'foo' },
      directives: {
        test (el, binding, vnode) {
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
})
