import Vue from 'vue'
import { injectStyles, waitForUpdate, nextFrame } from './helpers'

describe('Transition w/ KeepAlive', () => {
  const { duration, buffer } = injectStyles()

  let components, one, two, el
  beforeEach(() => {
    one = {
      template: '<div>one</div>',
      created: jasmine.createSpy(),
      mounted: jasmine.createSpy(),
      activated: jasmine.createSpy(),
      deactivated: jasmine.createSpy(),
      destroyed: jasmine.createSpy()
    }
    two = {
      template: '<div>two</div>',
      created: jasmine.createSpy(),
      mounted: jasmine.createSpy(),
      activated: jasmine.createSpy(),
      deactivated: jasmine.createSpy(),
      destroyed: jasmine.createSpy()
    }
    components = {
      one,
      two
    }
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  function assertHookCalls(component, callCounts) {
    expect([
      component.created.calls.count(),
      component.mounted.calls.count(),
      component.activated.calls.count(),
      component.deactivated.calls.count(),
      component.destroyed.calls.count()
    ]).toEqual(callCounts)
  }

  it('with transition-mode out-in', done => {
    let next
    const vm = new Vue({
      template: `<div>
          <transition name="test" mode="out-in" @after-leave="afterLeave">
            <keep-alive>
              <component :is="view" class="test"></component>
            </keep-alive>
          </transition>
        </div>`,
      data: {
        view: 'one'
      },
      components,
      methods: {
        afterLeave() {
          next()
        }
      }
    }).$mount(el)
    expect(vm.$el.textContent).toBe('one')
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])
    vm.view = 'two'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe(
        '<div class="test test-leave test-leave-active">one</div><!---->'
      )
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [0, 0, 0, 0, 0])
    })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">one</div><!---->'
        )
      })
      .thenWaitFor(_next => {
        next = _next
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<!---->')
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter test-enter-active">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 1, 0, 0])
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active test-enter-to">two</div>'
        )
      })
      .thenWaitFor(duration + buffer)
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">two</div>')
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 1, 0, 0])
      })
      .then(() => {
        vm.view = 'one'
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">two</div><!---->'
        )
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">two</div><!---->'
        )
      })
      .thenWaitFor(_next => {
        next = _next
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<!---->')
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter test-enter-active">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active test-enter-to">one</div>'
        )
      })
      .thenWaitFor(duration + buffer)
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">one</div>')
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      })
      .then(done)
  })

  it('with transition-mode out-in + include', done => {
    let next
    const vm = new Vue({
      template: `<div>
          <transition name="test" mode="out-in" @after-leave="afterLeave">
            <keep-alive include="one">
              <component :is="view" class="test"></component>
            </keep-alive>
          </transition>
        </div>`,
      data: {
        view: 'one'
      },
      components,
      methods: {
        afterLeave() {
          next()
        }
      }
    }).$mount(el)
    expect(vm.$el.textContent).toBe('one')
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])
    vm.view = 'two'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe(
        '<div class="test test-leave test-leave-active">one</div><!---->'
      )
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [0, 0, 0, 0, 0])
    })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">one</div><!---->'
        )
      })
      .thenWaitFor(_next => {
        next = _next
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<!---->')
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter test-enter-active">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 0, 0, 0])
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active test-enter-to">two</div>'
        )
      })
      .thenWaitFor(duration + buffer)
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">two</div>')
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 0, 0, 0])
      })
      .then(() => {
        vm.view = 'one'
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">two</div><!---->'
        )
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 0, 0, 1])
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">two</div><!---->'
        )
      })
      .thenWaitFor(_next => {
        next = _next
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<!---->')
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter test-enter-active">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 0, 0, 1])
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active test-enter-to">one</div>'
        )
      })
      .thenWaitFor(duration + buffer)
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">one</div>')
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 0, 0, 1])
      })
      .then(done)
  })

  it('with transition-mode in-out', done => {
    let next
    const vm = new Vue({
      template: `<div>
          <transition name="test" mode="in-out" @after-enter="afterEnter">
            <keep-alive>
              <component :is="view" class="test"></component>
            </keep-alive>
          </transition>
        </div>`,
      data: {
        view: 'one'
      },
      components,
      methods: {
        afterEnter() {
          next()
        }
      }
    }).$mount(el)
    expect(vm.$el.textContent).toBe('one')
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])
    vm.view = 'two'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe(
        '<div class="test">one</div>' +
          '<div class="test test-enter test-enter-active">two</div>'
      )
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])
    })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
            '<div class="test test-enter-active test-enter-to">two</div>'
        )
      })
      .thenWaitFor(_next => {
        next = _next
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' + '<div class="test">two</div>'
        )
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">one</div>' +
            '<div class="test">two</div>'
        )
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">one</div>' +
            '<div class="test">two</div>'
        )
      })
      .thenWaitFor(duration + buffer)
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">two</div>')
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 1, 0, 0])
      })
      .then(() => {
        vm.view = 'one'
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
            '<div class="test test-enter test-enter-active">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
            '<div class="test test-enter-active test-enter-to">one</div>'
        )
      })
      .thenWaitFor(_next => {
        next = _next
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' + '<div class="test">one</div>'
        )
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">two</div>' +
            '<div class="test">one</div>'
        )
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">two</div>' +
            '<div class="test">one</div>'
        )
      })
      .thenWaitFor(duration + buffer)
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">one</div>')
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      })
      .then(done)
  })

  it('dynamic components, in-out with early cancel', done => {
    let next
    const vm = new Vue({
      template: `<div>
          <transition name="test" mode="in-out" @after-enter="afterEnter">
            <keep-alive>
              <component :is="view" class="test"></component>
            </keep-alive>
          </transition>
        </div>`,
      data: { view: 'one' },
      components,
      methods: {
        afterEnter() {
          next()
        }
      }
    }).$mount(el)
    expect(vm.$el.textContent).toBe('one')
    vm.view = 'two'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe(
        '<div class="test">one</div>' +
          '<div class="test test-enter test-enter-active">two</div>'
      )
    })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
            '<div class="test test-enter-active test-enter-to">two</div>'
        )
        // switch again before enter finishes,
        // this cancels both enter and leave.
        vm.view = 'one'
      })
      .then(() => {
        // 1. the pending leaving "one" should be removed instantly.
        // 2. the entering "two" should be placed into its final state instantly.
        // 3. a new "one" is created and entering
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
            '<div class="test test-enter test-enter-active">one</div>'
        )
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
            '<div class="test test-enter-active test-enter-to">one</div>'
        )
      })
      .thenWaitFor(_next => {
        next = _next
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' + '<div class="test">one</div>'
        )
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">two</div>' +
            '<div class="test">one</div>'
        )
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">two</div>' +
            '<div class="test">one</div>'
        )
      })
      .thenWaitFor(duration + buffer)
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">one</div>')
      })
      .then(done)
  })

  // #4339
  it('component with inner transition', done => {
    const vm = new Vue({
      template: `
          <div>
            <keep-alive>
              <component ref="test" :is="view"></component>
            </keep-alive>
          </div>
        `,
      data: { view: 'foo' },
      components: {
        foo: {
          template: '<transition><div class="test">foo</div></transition>'
        },
        bar: {
          template:
            '<transition name="test"><div class="test">bar</div></transition>'
        }
      }
    }).$mount(el)

    // should not apply transition on initial render by default
    expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
    vm.view = 'bar'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe(
        '<div class="test v-leave v-leave-active">foo</div>' +
          '<div class="test test-enter test-enter-active">bar</div>'
      )
    })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test v-leave-active v-leave-to">foo</div>' +
            '<div class="test test-enter-active test-enter-to">bar</div>'
        )
      })
      .thenWaitFor(duration + buffer)
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">bar</div>')
        vm.view = 'foo'
      })
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">bar</div>' +
            '<div class="test v-enter v-enter-active">foo</div>'
        )
      })
      .thenWaitFor(nextFrame)
      .then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">bar</div>' +
            '<div class="test v-enter-active v-enter-to">foo</div>'
        )
      })
      .thenWaitFor(duration + buffer)
      .then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      })
      .then(done)
  })

  it('async components with transition-mode out-in', done => {
    const barResolve = jasmine.createSpy()
    let next
    const foo = resolve => {
      setTimeout(() => {
        resolve(one)
        Vue.nextTick(next)
      }, duration / 2)
    }
    const bar = resolve => {
      setTimeout(() => {
        resolve(two)
        barResolve()
      }, duration / 2)
    }
    components = {
      foo,
      bar
    }
    const vm = new Vue({
      template: `<div>
          <transition name="test" mode="out-in" @after-enter="afterEnter" @after-leave="afterLeave">
            <keep-alive>
              <component :is="view" class="test"></component>
            </keep-alive>
          </transition>
        </div>`,
      data: {
        view: 'foo'
      },
      components,
      methods: {
        afterEnter() {
          next()
        },
        afterLeave() {
          next()
        }
      }
    }).$mount(el)
    expect(vm.$el.textContent).toBe('')
    next = () => {
      assertHookCalls(one, [1, 1, 1, 0, 0])
      assertHookCalls(two, [0, 0, 0, 0, 0])
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter test-enter-active">one</div>'
        )
      })
        .thenWaitFor(nextFrame)
        .then(() => {
          expect(vm.$el.innerHTML).toBe(
            '<div class="test test-enter-active test-enter-to">one</div>'
          )
        })
        .thenWaitFor(_next => {
          next = _next
        })
        .then(() => {
          // foo afterEnter get called
          expect(vm.$el.innerHTML).toBe('<div class="test">one</div>')
          vm.view = 'bar'
        })
        .thenWaitFor(nextFrame)
        .then(() => {
          assertHookCalls(one, [1, 1, 1, 1, 0])
          assertHookCalls(two, [0, 0, 0, 0, 0])
          expect(vm.$el.innerHTML).toBe(
            '<div class="test test-leave-active test-leave-to">one</div><!---->'
          )
        })
        .thenWaitFor(_next => {
          next = _next
        })
        .then(() => {
          // foo afterLeave get called
          // and bar has already been resolved before afterLeave get called
          expect(barResolve.calls.count()).toBe(1)
          expect(vm.$el.innerHTML).toBe('<!---->')
        })
        .thenWaitFor(nextFrame)
        .then(() => {
          expect(vm.$el.innerHTML).toBe(
            '<div class="test test-enter test-enter-active">two</div>'
          )
          assertHookCalls(one, [1, 1, 1, 1, 0])
          assertHookCalls(two, [1, 1, 1, 0, 0])
        })
        .thenWaitFor(nextFrame)
        .then(() => {
          expect(vm.$el.innerHTML).toBe(
            '<div class="test test-enter-active test-enter-to">two</div>'
          )
        })
        .thenWaitFor(_next => {
          next = _next
        })
        .then(() => {
          // bar afterEnter get called
          expect(vm.$el.innerHTML).toBe('<div class="test">two</div>')
        })
        .then(done)
    }
  })

  // #10083
  it('should not attach event handler repeatedly', done => {
    const vm = new Vue({
      template: `
          <keep-alive>
            <btn v-if="showBtn" @click.native="add" />
          </keep-alive>
        `,
      data: { showBtn: true, n: 0 },
      methods: {
        add() {
          this.n++
        }
      },
      components: {
        btn: { template: '<button>add 1</button>' }
      }
    }).$mount()

    const btn = vm.$el
    expect(vm.n).toBe(0)
    btn.click()
    expect(vm.n).toBe(1)
    vm.showBtn = false
    waitForUpdate(() => {
      vm.showBtn = true
    })
      .then(() => {
        btn.click()
        expect(vm.n).toBe(2)
      })
      .then(done)
  })
})
