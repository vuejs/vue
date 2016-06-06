import Vue from 'vue'
import injectStyles from './inject-styles'
import { isIE9 } from 'web/util/index'
import { nextFrame } from 'web/runtime/modules/transition'

if (!isIE9) {
  describe('Transition mode', () => {
    const duration = injectStyles()
    const components = {
      one: { template: '<div>one</div>' },
      two: { template: '<div>two</div>' }
    }

    let el
    beforeEach(() => {
      el = document.createElement('div')
      document.body.appendChild(el)
    })

    it('dynamic components, simultaneous', done => {
      const vm = new Vue({
        template: `<div>
          <component
            :is="view"
            class="test"
            transition>
          </component>
        </div>`,
        data: { view: 'one' },
        components
      }).$mount(el)
      expect(vm.$el.textContent).toBe('one')
      vm.view = 'two'
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test v-enter">two</div>' +
          '<div class="test v-leave">one</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test v-enter-active">two</div>' +
          '<div class="test v-leave-active">one</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
      }).then(done)
    })

    it('dynamic components, out-in', done => {
      let next
      const vm = new Vue({
        template: `<div>
          <component
            :is="view"
            class="test"
            transition="test"
            transition-mode="out-in">
          </component>
        </div>`,
        data: { view: 'one' },
        components,
        transitions: {
          test: {
            afterLeave () {
              next()
            }
          }
        }
      }).$mount(el)
      expect(vm.$el.textContent).toBe('one')
      vm.view = 'two'
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave">one</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active">one</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe('')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter">two</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active">two</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
      }).then(done)
    })

    it('dynamic components, in-out', done => {
      let next
      const vm = new Vue({
        template: `<div>
          <component
            :is="view"
            class="test"
            transition="test"
            transition-mode="in-out">
          </component>
        </div>`,
        data: { view: 'one' },
        components,
        transitions: {
          test: {
            afterEnter () {
              next()
            }
          }
        }
      }).$mount(el)
      expect(vm.$el.textContent).toBe('one')
      vm.view = 'two'
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test test-enter">two</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test test-enter-active">two</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test">two</div>'
        )
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave">one</div>' +
          '<div class="test">two</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active">one</div>' +
          '<div class="test">two</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
      }).then(done)
    })

    it('normal elements with different keys, simultaneous', done => {
      const vm = new Vue({
        template: `<div>
          <div
            :key="view"
            class="test"
            transition>{{view}}</div>
        </div>`,
        data: { view: 'one' },
        components
      }).$mount(el)
      expect(vm.$el.textContent).toBe('one')
      vm.view = 'two'
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test v-enter">two</div>' +
          '<div class="test v-leave">one</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test v-enter-active">two</div>' +
          '<div class="test v-leave-active">one</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
      }).then(done)
    })

    it('normal elements with different keys, out-in', done => {
      let next
      const vm = new Vue({
        template: `<div>
          <div
            :key="view"
            class="test"
            transition="test"
            transition-mode="out-in">{{view}}</div>
        </div>`,
        data: { view: 'one' },
        components,
        transitions: {
          test: {
            afterLeave () {
              next()
            }
          }
        }
      }).$mount(el)
      expect(vm.$el.textContent).toBe('one')
      vm.view = 'two'
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave">one</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active">one</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe('')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter">two</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-enter-active">two</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
      }).then(done)
    })

    it('normal elements with different keys, in-out', done => {
      let next
      const vm = new Vue({
        template: `<div>
          <div
            :key="view"
            class="test"
            transition="test"
            transition-mode="in-out">{{view}}</component>
        </div>`,
        data: { view: 'one' },
        components,
        transitions: {
          test: {
            afterEnter () {
              next()
            }
          }
        }
      }).$mount(el)
      expect(vm.$el.textContent).toBe('one')
      vm.view = 'two'
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test test-enter">two</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test test-enter-active">two</div>'
        )
      }).thenWaitFor(_next => { next = _next }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">one</div>' +
          '<div class="test">two</div>'
        )
      }).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave">one</div>' +
          '<div class="test">two</div>'
        )
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test test-leave-active">one</div>' +
          '<div class="test">two</div>'
        )
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe(
          '<div class="test">two</div>'
        )
      }).then(done)
    })
  })
}
