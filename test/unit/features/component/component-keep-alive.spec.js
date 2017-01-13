import Vue from 'vue'
import injectStyles from '../transition/inject-styles'
import { isIE9 } from 'core/util/env'
import { nextFrame } from 'web/runtime/transition-util'

describe('Component keep-alive', () => {
  const { duration, buffer } = injectStyles()
  let components, one, two, el
  beforeEach(() => {
    one = {
      template: '<div>one</div>',
      created: jasmine.createSpy('one created'),
      mounted: jasmine.createSpy('one mounted'),
      activated: jasmine.createSpy('one activated'),
      deactivated: jasmine.createSpy('one deactivated'),
      destroyed: jasmine.createSpy('one destroyed')
    }
    two = {
      template: '<div>two</div>',
      created: jasmine.createSpy('two created'),
      mounted: jasmine.createSpy('two mounted'),
      activated: jasmine.createSpy('two activated'),
      deactivated: jasmine.createSpy('two deactivated'),
      destroyed: jasmine.createSpy('two destroyed')
    }
    components = {
      one,
      two
    }
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  function assertHookCalls (component, callCounts) {
    expect([
      component.created.calls.count(),
      component.mounted.calls.count(),
      component.activated.calls.count(),
      component.deactivated.calls.count(),
      component.destroyed.calls.count()
    ]).toEqual(callCounts)
  }

  it('should work', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive>
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    expect(vm.$el.textContent).toBe('one')
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])
    vm.view = 'two'
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('two')
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])
      vm.view = 'one'
    }).then(() => {
      expect(vm.$el.textContent).toBe('one')
      assertHookCalls(one, [1, 1, 2, 1, 0])
      assertHookCalls(two, [1, 1, 1, 1, 0])
      vm.view = 'two'
    }).then(() => {
      expect(vm.$el.textContent).toBe('two')
      assertHookCalls(one, [1, 1, 2, 2, 0])
      assertHookCalls(two, [1, 1, 2, 1, 0])
      vm.ok = false // teardown
    }).then(() => {
      expect(vm.$el.textContent).toBe('')
      assertHookCalls(one, [1, 1, 2, 2, 1])
      assertHookCalls(two, [1, 1, 2, 2, 1])
    }).then(done)
  })

  function sharedAssertions (vm, done) {
    expect(vm.$el.textContent).toBe('one')
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])
    vm.view = 'two'
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('two')
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 0, 0, 0])
      vm.view = 'one'
    }).then(() => {
      expect(vm.$el.textContent).toBe('one')
      assertHookCalls(one, [1, 1, 2, 1, 0])
      assertHookCalls(two, [1, 1, 0, 0, 1])
      vm.view = 'two'
    }).then(() => {
      expect(vm.$el.textContent).toBe('two')
      assertHookCalls(one, [1, 1, 2, 2, 0])
      assertHookCalls(two, [2, 2, 0, 0, 1])
      vm.ok = false // teardown
    }).then(() => {
      expect(vm.$el.textContent).toBe('')
      assertHookCalls(one, [1, 1, 2, 2, 1])
      assertHookCalls(two, [2, 2, 0, 0, 2])
    }).then(done)
  }

  it('include (string)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive include="one">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('include (regex)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive :include="/^one$/">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('exclude (string)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive exclude="two">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('exclude (regex)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive :exclude="/^two$/">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('include + exclude', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive include="one,two" exclude="two">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('prune cache on include/exclude change', done => {
    const vm = new Vue({
      template: `
        <div>
          <keep-alive :include="include">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        include: 'one,two'
      },
      components
    }).$mount()

    vm.view = 'two'
    waitForUpdate(() => {
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])
      vm.include = 'two'
      vm.view = 'one'
    }).then(() => {
      assertHookCalls(one, [2, 2, 1, 1, 1])
      assertHookCalls(two, [1, 1, 1, 1, 0])
    }).then(done)
  })

  // #3882
  it('deeply nested keep-alive should be destroyed properly', done => {
    one.template = `<div><keep-alive><two></two></keep-alive></div>`
    one.components = { two }
    const vm = new Vue({
      template: `<div><parent v-if="ok"></parent></div>`,
      data: { ok: true },
      components: {
        parent: {
          template: `<div><keep-alive><one></one></keep-alive></div>`,
          components: { one }
        }
      }
    }).$mount()

    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [1, 1, 1, 0, 0])

    vm.ok = false
    waitForUpdate(() => {
      assertHookCalls(one, [1, 1, 1, 1, 1])
      assertHookCalls(two, [1, 1, 1, 1, 1])
    }).then(done)
  })

  // #4237
  it('should update latest props/listners for a re-activated component', done => {
    const one = {
      props: ['prop'],
      template: `<div>one {{ prop }}</div>`
    }
    const two = {
      props: ['prop'],
      template: `<div>two {{ prop }}</div>`
    }
    const vm = new Vue({
      data: { view: 'one', n: 1 },
      template: `
        <div>
          <keep-alive>
            <component :is="view" :prop="n"></component>
          </keep-alive>
        </div>
      `,
      components: { one, two }
    }).$mount()

    expect(vm.$el.textContent).toBe('one 1')
    vm.n++
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('one 2')
      vm.view = 'two'
    }).then(() => {
      expect(vm.$el.textContent).toBe('two 2')
    }).then(done)
  })

  if (!isIE9) {
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
          afterLeave () {
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
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">one</div><!---->'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe('<!---->')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter test-enter-active">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 1, 0, 0])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active test-enter-to">two</div>'
        )
      }).thenWaitFor(duration + buffer).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 1, 0, 0])
      }).then(() => {
        vm.view = 'one'
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">two</div><!---->'
        )
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">two</div><!---->'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe('<!---->')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter test-enter-active">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active test-enter-to">one</div>'
        )
      }).thenWaitFor(duration + buffer).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      }).then(done)
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
          afterEnter () {
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
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test test-enter-active test-enter-to">two</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test">two</div>'
        )
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">one</div>' +
          '<div class="test">two</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">one</div>' +
          '<div class="test">two</div>'
        )
      }).thenWaitFor(duration + buffer).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
        assertHookCalls(one, [1, 1, 1, 1, 0])
        assertHookCalls(two, [1, 1, 1, 0, 0])
      }).then(() => {
        vm.view = 'one'
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
          '<div class="test test-enter test-enter-active">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
          '<div class="test test-enter-active test-enter-to">one</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
          '<div class="test">one</div>'
        )
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">two</div>' +
          '<div class="test">one</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">two</div>' +
          '<div class="test">one</div>'
        )
      }).thenWaitFor(duration + buffer).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>'
        )
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      }).then(done)
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
          afterEnter () {
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
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test test-enter-active test-enter-to">two</div>'
        )
        // switch again before enter finishes,
        // this cancels both enter and leave.
        vm.view = 'one'
      }).then(() => {
        // 1. the pending leaving "one" should be removed instantly.
        // 2. the entering "two" should be placed into its final state instantly.
        // 3. a new "one" is created and entering
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
          '<div class="test test-enter test-enter-active">one</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
          '<div class="test test-enter-active test-enter-to">one</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>' +
          '<div class="test">one</div>'
        )
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">two</div>' +
          '<div class="test">one</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">two</div>' +
          '<div class="test">one</div>'
        )
      }).thenWaitFor(duration + buffer).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>'
        )
      }).then(done).then(done)
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
          foo: { template: '<transition><div class="test">foo</div></transition>' },
          bar: { template: '<transition name="test"><div class="test">bar</div></transition>' }
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
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test v-leave-active v-leave-to">foo</div>' +
          '<div class="test test-enter-active test-enter-to">bar</div>'
        )
      }).thenWaitFor(duration + buffer).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">bar</div>'
        )
        vm.view = 'foo'
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave test-leave-active">bar</div>' +
          '<div class="test v-enter v-enter-active">foo</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active test-leave-to">bar</div>' +
          '<div class="test v-enter-active v-enter-to">foo</div>'
        )
      }).thenWaitFor(duration + buffer).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">foo</div>'
        )
      }).then(done)
    })
  }
})
