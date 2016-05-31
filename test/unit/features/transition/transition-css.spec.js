import Vue from 'vue'
import { isIE9 } from 'web/util/index'
import { nextFrame } from 'web/runtime/modules/transition'

if (!isIE9) {
  describe('Transition CSS', () => {
    const duration = 50
    insertCSS(`
      .test {
        -webkit-transition: opacity ${duration}ms ease;
        transition: opacity ${duration}ms ease;
      }
      .test-enter, .test-leave-active {
        opacity: 0;
      }
      .test-anim-enter {
        animation: test-enter ${duration}ms;
        -webkit-animation: test-enter ${duration}ms;
      }
      .test-anim-leave {
        animation: test-leave ${duration}ms;
        -webkit-animation: test-leave ${duration}ms;
      }
      @keyframes test-enter {
        from { opacity: 0 }
        to { opacity: 1 }
      }
      @-webkit-keyframes test-enter {
        from { opacity: 0 }
        to { opacity: 1 }
      }
      @keyframes test-leave {
        from { opacity: 1 }
        to { opacity: 0 }
      }
      @-webkit-keyframes test-leave {
        from { opacity: 1 }
        to { opacity: 0 }
      }
    `)

    it('basic transitions', done => {
      const el = document.createElement('div')
      document.body.appendChild(el)
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(timeout(duration + 1)).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(timeout(duration + 1)).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })
  })
}

function insertCSS (text) {
  var cssEl = document.createElement('style')
  cssEl.textContent = text.trim()
  document.head.appendChild(cssEl)
}

function timeout (n) {
  return next => setTimeout(next, n)
}
