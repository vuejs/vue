import Vue from 'vue'

const components = createErrorTestComponents()

describe('Error handling', () => {
  // hooks that prevents the component from rendering, but should not
  // break parent component
  ;[
    ['render', 'render function'],
    ['beforeCreate', 'beforeCreate hook'],
    ['created', 'created hook'],
    ['beforeMount', 'beforeMount hook']
  ].forEach(([type, description]) => {
    it(`should recover from errors in ${type}`, done => {
      const vm = createTestInstance(components[type])
      expect(`Error in ${description}`).toHaveBeenWarned()
      expect(`Error: ${type}`).toHaveBeenWarned()
      assertRootInstanceActive(vm).then(done)
    })
  })

  // error in mounted hook should affect neither child nor parent
  it('should recover from errors in mounted hook', done => {
    const vm = createTestInstance(components.mounted)
    expect(`Error in mounted hook`).toHaveBeenWarned()
    expect(`Error: mounted`).toHaveBeenWarned()
    assertBothInstancesActive(vm).then(done)
  })

  // error in beforeUpdate/updated should affect neither child nor parent
  ;[
    ['beforeUpdate', 'beforeUpdate hook'],
    ['updated', 'updated hook']
  ].forEach(([type, description]) => {
    it(`should recover from errors in ${type} hook`, done => {
      const vm = createTestInstance(components[type])
      assertBothInstancesActive(vm).then(() => {
        expect(`Error in ${description}`).toHaveBeenWarned()
        expect(`Error: ${type}`).toHaveBeenWarned()
      }).then(done)
    })
  })

  ;[
    ['beforeDestroy', 'beforeDestroy hook'],
    ['destroyed', 'destroyed hook']
  ].forEach(([type, description]) => {
    it(`should recover from errors in ${type} hook`, done => {
      const vm = createTestInstance(components[type])
      vm.ok = false
      waitForUpdate(() => {
        expect(`Error in ${description}`).toHaveBeenWarned()
        expect(`Error: ${type}`).toHaveBeenWarned()
      }).thenWaitFor(next => {
        assertRootInstanceActive(vm).end(next)
      }).then(done)
    })
  })

  it('should recover from errors in user watcher getter', done => {
    const vm = createTestInstance(components.userWatcherGetter)
    vm.n++
    waitForUpdate(() => {
      expect(`Error in getter for watcher`).toHaveBeenWarned()
      function getErrorMsg () {
        try {
          this.a.b.c
        } catch (e) {
          return e.toString()
        }
      }
      const msg = getErrorMsg.call(vm)
      expect(msg).toHaveBeenWarned()
    }).thenWaitFor(next => {
      assertBothInstancesActive(vm).end(next)
    }).then(done)
  })

  it('should recover from errors in user watcher callback', done => {
    const vm = createTestInstance(components.userWatcherCallback)
    vm.n++
    waitForUpdate(() => {
      expect(`Error in callback for watcher "n"`).toHaveBeenWarned()
      expect(`Error: userWatcherCallback`).toHaveBeenWarned()
    }).thenWaitFor(next => {
      assertBothInstancesActive(vm).end(next)
    }).then(done)
  })

  it('config.errorHandler should capture errors', done => {
    const spy = Vue.config.errorHandler = jasmine.createSpy('errorHandler')
    const vm = createTestInstance(components.render)

    const args = spy.calls.argsFor(0)
    expect(args[0].toString()).toContain('Error: render') // error
    expect(args[1]).toBe(vm.$refs.child) // vm
    expect(args[2]).toContain('render function') // description

    assertRootInstanceActive(vm).then(() => {
      Vue.config.errorHandler = null
    }).then(done)
  })

  it('properly format component names', () => {
    const format = Vue.util.formatComponentName
    const vm = new Vue()
    expect(format(vm)).toBe('<Root>')

    vm.$root = null
    vm.$options.name = 'hello-there'
    expect(format(vm)).toBe('<HelloThere>')

    vm.$options.name = null
    vm.$options._componentTag = 'foo-bar-1'
    expect(format(vm)).toBe('<FooBar1>')

    vm.$options._componentTag = null
    vm.$options.__file = '/foo/bar/baz/SomeThing.vue'
    expect(format(vm)).toBe(`<SomeThing> at ${vm.$options.__file}`)
    expect(format(vm, false)).toBe('<SomeThing>')

    vm.$options.__file = 'C:\\foo\\bar\\baz\\windows_file.vue'
    expect(format(vm)).toBe(`<WindowsFile> at ${vm.$options.__file}`)
    expect(format(vm, false)).toBe('<WindowsFile>')
  })
})

function createErrorTestComponents () {
  const components = {}

  // render error
  components.render = {
    render (h) {
      throw new Error('render')
    }
  }

  // lifecycle errors
  ;['create', 'mount', 'update', 'destroy'].forEach(hook => {
    // before
    const before = 'before' + hook.charAt(0).toUpperCase() + hook.slice(1)
    const beforeComp = components[before] = {
      props: ['n'],
      render (h) {
        return h('div', this.n)
      }
    }
    beforeComp[before] = function () {
      throw new Error(before)
    }

    // after
    const after = hook.replace(/e?$/, 'ed')
    const afterComp = components[after] = {
      props: ['n'],
      render (h) {
        return h('div', this.n)
      }
    }
    afterComp[after] = function () {
      throw new Error(after)
    }
  })

  // user watcher
  components.userWatcherGetter = {
    props: ['n'],
    created () {
      this.$watch(function () {
        return this.n + this.a.b.c
      }, val => {
        console.log('user watcher fired: ' + val)
      })
    },
    render (h) {
      return h('div', this.n)
    }
  }

  components.userWatcherCallback = {
    props: ['n'],
    watch: {
      n () {
        throw new Error('userWatcherCallback error')
      }
    },
    render (h) {
      return h('div', this.n)
    }
  }

  return components
}

function createTestInstance (Comp) {
  return new Vue({
    data: {
      n: 0,
      ok: true
    },
    render (h) {
      return h('div', [
        'n:' + this.n + '\n',
        this.ok
          ? h(Comp, { ref: 'child', props: { n: this.n }})
          : null
      ])
    }
  }).$mount()
}

function assertRootInstanceActive (vm, chain) {
  expect(vm.$el.innerHTML).toContain('n:0\n')
  vm.n++
  return waitForUpdate(() => {
    expect(vm.$el.innerHTML).toContain('n:1\n')
  })
}

function assertBothInstancesActive (vm) {
  vm.n = 0
  return waitForUpdate(() => {
    expect(vm.$refs.child.$el.innerHTML).toContain('0')
  }).thenWaitFor(next => {
    assertRootInstanceActive(vm).then(() => {
      expect(vm.$refs.child.$el.innerHTML).toContain('1')
    }).end(next)
  })
}
