const Vue = require('vue/dist/vue.common.js')
const {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  getCurrentInstance,
} = require('../../src')

describe('Hooks lifecycle', () => {
  describe('beforeMount', () => {
    it('should not have mounted', () => {
      const spy = jest.fn()
      const vm = new Vue({
        render() {},
        setup(_, { _vm }) {
          onBeforeMount(() => {
            expect(_vm._isMounted).toBe(false)
            expect(_vm.$el).toBeUndefined() // due to empty mount
            expect(_vm._vnode).toBeNull()
            expect(_vm._watcher).toBeNull()
            spy()
          })
        },
      })
      expect(spy).not.toHaveBeenCalled()
      vm.$mount()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('mounted', () => {
    it('should have mounted', () => {
      const spy = jest.fn()
      const vm = new Vue({
        template: '<div></div>',
        setup(_, { _vm }) {
          onMounted(() => {
            expect(_vm._isMounted).toBe(true)
            expect(_vm.$el.tagName).toBe('DIV')
            expect(_vm._vnode.tag).toBe('div')
            spy()
          })
        },
      })
      expect(spy).not.toHaveBeenCalled()
      vm.$mount()
      expect(spy).toHaveBeenCalled()
    })

    it('should call for manually mounted instance with parent', () => {
      const spy = jest.fn()
      const parent = new Vue()
      expect(spy).not.toHaveBeenCalled()
      new Vue({
        parent,
        template: '<div></div>',
        setup() {
          onMounted(() => {
            spy()
          })
        },
      }).$mount()
      expect(spy).toHaveBeenCalled()
    })

    it('should mount child parent in correct order', () => {
      const calls = []
      new Vue({
        template: '<div><test></test></div>',
        setup() {
          onMounted(() => {
            calls.push('parent')
          })
        },
        components: {
          test: {
            template: '<nested></nested>',
            setup(_, { _vm }) {
              onMounted(() => {
                expect(_vm.$el.parentNode).toBeTruthy()
                calls.push('child')
              })
            },
            components: {
              nested: {
                template: '<div></div>',
                setup(_, { _vm }) {
                  onMounted(() => {
                    expect(_vm.$el.parentNode).toBeTruthy()
                    calls.push('nested')
                  })
                },
              },
            },
          },
        },
      }).$mount()
      expect(calls).toEqual(['nested', 'child', 'parent'])
    })

    it('getCurrentInstance should be available', () => {
      const parent = new Vue()
      let instance
      new Vue({
        parent,
        template: '<div></div>',
        setup() {
          onMounted(() => {
            instance = getCurrentInstance()
          })
        },
      }).$mount()
      expect(instance).toBeDefined()
    })

    it('getCurrentInstance should not be available on promised hook', () => {
      const parent = new Vue()
      let instance
      let promisedInstance
      new Vue({
        parent,
        template: '<div></div>',
        setup() {
          onMounted(async () => {
            instance = getCurrentInstance()
            await Promise.resolve()
            promisedInstance = getCurrentInstance()
          })
        },
      }).$mount()
      expect(instance).toBeDefined()
      expect(promisedInstance).not.toBeDefined()
    })
  })

  describe('beforeUpdate', () => {
    it('should be called before update', (done) => {
      const spy = jest.fn()
      const vm = new Vue({
        template: '<div>{{ msg }}</div>',
        data: { msg: 'foo' },
        setup(_, { _vm }) {
          onBeforeUpdate(() => {
            expect(_vm.$el.textContent).toBe('foo')
            spy()
          })
        },
      }).$mount()
      expect(spy).not.toHaveBeenCalled()
      vm.msg = 'bar'
      expect(spy).not.toHaveBeenCalled() // should be async
      waitForUpdate(() => {
        expect(spy).toHaveBeenCalled()
      }).then(done)
    })

    it('should be called before render and allow mutating state', (done) => {
      const vm = new Vue({
        template: '<div>{{ msg }}</div>',
        data: { msg: 'foo' },
        setup(_, { _vm }) {
          onBeforeUpdate(() => {
            _vm.msg += '!'
          })
        },
      }).$mount()
      expect(vm.$el.textContent).toBe('foo')
      vm.msg = 'bar'
      waitForUpdate(() => {
        expect(vm.$el.textContent).toBe('bar!')
      }).then(done)
    })

    it('should not be called after destroy', (done) => {
      const beforeUpdate = jest.fn()
      const destroyed = jest.fn()

      Vue.component('todo', {
        template: '<div>{{todo.done}}</div>',
        props: ['todo'],
        setup() {
          onBeforeUpdate(beforeUpdate)
          onUnmounted(destroyed)
        },
      })

      const vm = new Vue({
        template: `
          <div>
            <todo v-for="t in pendingTodos" :todo="t" :key="t.id"></todo>
          </div>
        `,
        data() {
          return {
            todos: [{ id: 1, done: false }],
          }
        },
        computed: {
          pendingTodos() {
            return this.todos.filter((t) => !t.done)
          },
        },
      }).$mount()

      vm.todos[0].done = true
      waitForUpdate(() => {
        expect(destroyed).toHaveBeenCalled()
        expect(beforeUpdate).not.toHaveBeenCalled()
      }).then(done)
    })
  })

  describe('updated', () => {
    it('should be called after update', (done) => {
      const spy = jest.fn()
      const vm = new Vue({
        template: '<div>{{ msg }}</div>',
        data: { msg: 'foo' },
        setup(_, { _vm }) {
          onUpdated(() => {
            expect(_vm.$el.textContent).toBe('bar')
            spy()
          })
        },
      }).$mount()
      expect(spy).not.toHaveBeenCalled()
      vm.msg = 'bar'
      expect(spy).not.toHaveBeenCalled() // should be async
      waitForUpdate(() => {
        expect(spy).toHaveBeenCalled()
      }).then(done)
    })

    it('should be called after children are updated', (done) => {
      const calls = []
      const vm = new Vue({
        template: '<div><test ref="child">{{ msg }}</test></div>',
        data: { msg: 'foo' },
        components: {
          test: {
            template: `<div><slot></slot></div>`,
            setup(_, { _vm }) {
              onUpdated(() => {
                expect(_vm.$el.textContent).toBe('bar')
                calls.push('child')
              })
            },
          },
        },
        setup(_, { _vm }) {
          onUpdated(() => {
            expect(_vm.$el.textContent).toBe('bar')
            calls.push('parent')
          })
        },
      }).$mount()

      expect(calls).toEqual([])
      vm.msg = 'bar'
      expect(calls).toEqual([])
      waitForUpdate(() => {
        expect(calls).toEqual(['child', 'parent'])
      }).then(done)
    })

    it('should not be called after destroy', (done) => {
      const updated = jest.fn()
      const destroyed = jest.fn()

      Vue.component('todo', {
        template: '<div>{{todo.done}}</div>',
        props: ['todo'],
        setup() {
          onUpdated(updated)
          onUnmounted(destroyed)
        },
      })

      const vm = new Vue({
        template: `
          <div>
            <todo v-for="t in pendingTodos" :todo="t" :key="t.id"></todo>
          </div>
        `,
        data() {
          return {
            todos: [{ id: 1, done: false }],
          }
        },
        computed: {
          pendingTodos() {
            return this.todos.filter((t) => !t.done)
          },
        },
      }).$mount()

      vm.todos[0].done = true
      waitForUpdate(() => {
        expect(destroyed).toHaveBeenCalled()
        expect(updated).not.toHaveBeenCalled()
      }).then(done)
    })
  })

  describe('beforeUnmount', () => {
    it('should be called before destroy', () => {
      const spy = jest.fn()
      const vm = new Vue({
        render() {},
        setup(_, { _vm }) {
          onBeforeUnmount(() => {
            expect(_vm._isBeingDestroyed).toBe(false)
            expect(_vm._isDestroyed).toBe(false)
            spy()
          })
        },
      }).$mount()
      expect(spy).not.toHaveBeenCalled()
      vm.$destroy()
      vm.$destroy()
      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls.length).toBe(1)
    })
  })

  describe('unmounted', () => {
    it('should be called after destroy', () => {
      const spy = jest.fn()
      const vm = new Vue({
        render() {},
        setup(_, { _vm }) {
          onUnmounted(() => {
            expect(_vm._isBeingDestroyed).toBe(true)
            expect(_vm._isDestroyed).toBe(true)
            spy()
          })
        },
      }).$mount()
      expect(spy).not.toHaveBeenCalled()
      vm.$destroy()
      vm.$destroy()
      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls.length).toBe(1)
    })
  })

  describe('errorCaptured', () => {
    let globalSpy

    beforeEach(() => {
      globalSpy = Vue.config.errorHandler = jest.fn()
    })

    afterEach(() => {
      Vue.config.errorHandler = null
    })

    it('should capture error from child component', () => {
      const spy = jest.fn()

      let child
      let err
      const Child = {
        setup(_, { _vm }) {
          child = _vm
          err = new Error('child')
          throw err
        },
        render() {},
      }

      new Vue({
        setup() {
          onErrorCaptured(spy)
        },
        render: (h) => h(Child),
      }).$mount()

      expect(spy).toHaveBeenCalledWith(err, child, 'data()')
      // should propagate by default
      expect(globalSpy).toHaveBeenCalledWith(err, child, 'data()')
    })
  })
})
