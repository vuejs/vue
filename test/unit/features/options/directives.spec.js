import Vue from 'vue'

describe('Options directives', () => {
  it('basic usage', done => {
    const bindSpy = jasmine.createSpy('bind')
    const updateSpy = jasmine.createSpy('update')
    const componentUpdatedSpy = jasmine.createSpy('componentUpdated')
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
            expect(binding.expression).toBe('a')
            expect(binding.oldValue).toBeUndefined()
          },
          update (el, binding, vnode, oldVnode) {
            updateSpy()
            assertContext(el, binding, vnode)
            expect(el).toBe(vm.$el)
            expect(oldVnode).not.toBe(vnode)
            expect(binding.expression).toBe('a')
            if (binding.value !== binding.oldValue) {
              expect(binding.value).toBe('bar')
              expect(binding.oldValue).toBe('foo')
            }
          },
          componentUpdated (el, binding, vnode) {
            componentUpdatedSpy()
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
    expect(componentUpdatedSpy).not.toHaveBeenCalled()
    expect(unbindSpy).not.toHaveBeenCalled()
    vm.a = 'bar'
    waitForUpdate(() => {
      expect(updateSpy).toHaveBeenCalled()
      expect(componentUpdatedSpy).toHaveBeenCalled()
      expect(unbindSpy).not.toHaveBeenCalled()
      vm.msg = 'bye'
    }).then(() => {
      expect(componentUpdatedSpy.calls.count()).toBe(2)
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

  it('function shorthand (global)', done => {
    const spy = jasmine.createSpy('directive')
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
          bind: el => { el.id = 'a' },
          unbind: el => { el.id = '' }
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

  it('warn non-existent', () => {
    new Vue({
      template: '<div v-test></div>'
    }).$mount()
    expect('Failed to resolve directive: test').toHaveBeenWarned()
  })
})
