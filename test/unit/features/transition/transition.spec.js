import Vue from 'vue'
import injectStyles from './inject-styles'
import { isIE9 } from 'web/util/index'
import { nextFrame } from 'web/runtime/transition-util'

if (!isIE9) {
  describe('Transition basic', () => {
    const duration = injectStyles()

    let el
    beforeEach(() => {
      el = document.createElement('div')
      document.body.appendChild(el)
    })

    it('basic transition', done => {
      const vm = new Vue({
        template: '<div><transition><div v-if="ok" class="test">foo</div></transition></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave v-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter v-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('named transition', done => {
      const vm = new Vue({
        template: '<div><transition name="test"><div v-if="ok" class="test">foo</div></transition></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('custom transition classes', done => {
      const vm = new Vue({
        template: `
          <div>
            <transition
              enter-class="hello"
              enter-active-class="hello-active"
              leave-class="bye"
              leave-active-class="byebye active">
              <div v-if="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test bye byebye active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test byebye active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello hello-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('dynamic transition', done => {
      const vm = new Vue({
        template: `
          <div>
            <transition :name="trans">
              <div v-if="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: {
          ok: true,
          trans: 'test'
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
        vm.trans = 'changed'
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test changed-enter changed-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test changed-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('inline transition object', done => {
      const enter = jasmine.createSpy('enter')
      const leave = jasmine.createSpy('leave')
      const vm = new Vue({
        render (h) {
          return h('div', null, [
            h('transition', {
              props: {
                name: 'inline',
                enterClass: 'hello',
                enterActiveClass: 'hello-active',
                leaveClass: 'bye',
                leaveActiveClass: 'byebye active'
              },
              on: {
                enter,
                leave
              }
            }, this.ok ? [h('div', { class: 'test' }, 'foo')] : undefined)
          ])
        },
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test bye byebye active')
        expect(leave).toHaveBeenCalled()
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test byebye active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello hello-active')
        expect(enter).toHaveBeenCalled()
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition events', done => {
      const onLeaveSpy = jasmine.createSpy('leave')
      const onEnterSpy = jasmine.createSpy('enter')
      const beforeLeaveSpy = jasmine.createSpy('beforeLeave')
      const beforeEnterSpy = jasmine.createSpy('beforeEnter')
      const afterLeaveSpy = jasmine.createSpy('afterLeave')
      const afterEnterSpy = jasmine.createSpy('afterEnter')

      const vm = new Vue({
        template: `
          <div>
            <transition
              name="test"
              @before-enter="beforeEnter"
              @enter="enter"
              @after-enter="afterEnter"
              @before-leave="beforeLeave"
              @leave="leave"
              @after-leave="afterLeave">
              <div v-if="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true },
        methods: {
          beforeLeave: (el) => {
            expect(el).toBe(vm.$el.children[0])
            expect(el.className).toBe('test')
            beforeLeaveSpy(el)
          },
          leave: (el) => onLeaveSpy(el),
          afterLeave: (el) => afterLeaveSpy(el),
          beforeEnter: (el) => {
            expect(vm.$el.contains(el)).toBe(false)
            expect(el.className).toBe('test')
            beforeEnterSpy(el)
          },
          enter: (el) => {
            expect(vm.$el.contains(el)).toBe(true)
            onEnterSpy(el)
          },
          afterEnter: (el) => afterEnterSpy(el)
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')

      let _el = vm.$el.children[0]
      vm.ok = false
      waitForUpdate(() => {
        expect(beforeLeaveSpy).toHaveBeenCalledWith(_el)
        expect(onLeaveSpy).toHaveBeenCalledWith(_el)
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(afterLeaveSpy).not.toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(afterLeaveSpy).toHaveBeenCalledWith(_el)
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        _el = vm.$el.children[0]
        expect(beforeEnterSpy).toHaveBeenCalledWith(_el)
        expect(onEnterSpy).toHaveBeenCalledWith(_el)
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(afterEnterSpy).not.toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(afterEnterSpy).toHaveBeenCalledWith(_el)
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition events (v-show)', done => {
      const onLeaveSpy = jasmine.createSpy('leave')
      const onEnterSpy = jasmine.createSpy('enter')
      const beforeLeaveSpy = jasmine.createSpy('beforeLeave')
      const beforeEnterSpy = jasmine.createSpy('beforeEnter')
      const afterLeaveSpy = jasmine.createSpy('afterLeave')
      const afterEnterSpy = jasmine.createSpy('afterEnter')

      const vm = new Vue({
        template: `
          <div>
            <transition
              name="test"
              @before-enter="beforeEnter"
              @enter="enter"
              @after-enter="afterEnter"
              @before-leave="beforeLeave"
              @leave="leave"
              @after-leave="afterLeave">
              <div v-show="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true },
        methods: {
          beforeLeave: (el) => {
            expect(el).toBe(vm.$el.children[0])
            expect(el.className).toBe('test')
            beforeLeaveSpy(el)
          },
          leave: (el) => onLeaveSpy(el),
          afterLeave: (el) => afterLeaveSpy(el),
          beforeEnter: (el) => {
            expect(el.className).toBe('test')
            beforeEnterSpy(el)
          },
          enter: (el) => {
            onEnterSpy(el)
          },
          afterEnter: (el) => afterEnterSpy(el)
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')

      let _el = vm.$el.children[0]
      vm.ok = false
      waitForUpdate(() => {
        expect(beforeLeaveSpy).toHaveBeenCalledWith(_el)
        expect(onLeaveSpy).toHaveBeenCalledWith(_el)
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(afterLeaveSpy).not.toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(afterLeaveSpy).toHaveBeenCalledWith(_el)
        expect(vm.$el.children[0].style.display).toBe('none')
        vm.ok = true
      }).then(() => {
        _el = vm.$el.children[0]
        expect(beforeEnterSpy).toHaveBeenCalledWith(_el)
        expect(onEnterSpy).toHaveBeenCalledWith(_el)
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(afterEnterSpy).not.toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(afterEnterSpy).toHaveBeenCalledWith(_el)
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('explicit user callback in JavaScript hooks', done => {
      let next
      const vm = new Vue({
        template: `<div>
          <transition name="test" @enter="enter" @leave="leave">
            <div v-if="ok" class="test">foo</div>
          </transition>
        </div>`,
        data: { ok: true },
        methods: {
          enter: (el, cb) => {
            next = cb
          },
          leave: (el, cb) => {
            next = cb
          }
        }
      }).$mount(el)
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
        expect(next).toBeTruthy()
        next()
        expect(vm.$el.children.length).toBe(0)
      }).then(() => {
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
        expect(next).toBeTruthy()
        next()
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('css: false', done => {
      const enterSpy = jasmine.createSpy('enter')
      const leaveSpy = jasmine.createSpy('leave')
      const vm = new Vue({
        template: `
          <div>
            <transition :css="false" name="test" @enter="enter" @leave="leave">
              <div v-if="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true },
        methods: {
          enter: enterSpy,
          leave: leaveSpy
        }
      }).$mount(el)

      vm.ok = false
      waitForUpdate(() => {
        expect(leaveSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('<!---->')
        vm.ok = true
      }).then(() => {
        expect(enterSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      }).then(done)
    })

    it('no transition detected', done => {
      const enterSpy = jasmine.createSpy('enter')
      const leaveSpy = jasmine.createSpy('leave')
      const vm = new Vue({
        template: '<div><transition name="nope" @enter="enter" @leave="leave"><div v-if="ok">foo</div></transition></div>',
        data: { ok: true },
        methods: {
          enter: enterSpy,
          leave: leaveSpy
        }
      }).$mount(el)

      vm.ok = false
      waitForUpdate(() => {
        expect(leaveSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('<div class="nope-leave nope-leave-active">foo</div><!---->')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toBe('<!---->')
        vm.ok = true
      }).then(() => {
        expect(enterSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('<div class="nope-enter nope-enter-active">foo</div>')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.innerHTML).toMatch(/<div( class="")?>foo<\/div>/)
      }).then(done)
    })

    it('enterCancelled', done => {
      const spy = jasmine.createSpy('enterCancelled')
      const vm = new Vue({
        template: `
          <div>
            <transition name="test" @enter-cancelled="enterCancelled">
              <div v-if="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: false },
        methods: {
          enterCancelled: spy
        }
      }).$mount(el)

      expect(vm.$el.innerHTML).toBe('<!---->')
      vm.ok = true
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(duration / 2).then(() => {
        vm.ok = false
      }).then(() => {
        expect(spy).toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
      }).then(done)
    })

    it('should remove stale leaving elements', done => {
      const spy = jasmine.createSpy('afterLeave')
      const vm = new Vue({
        template: `
          <div>
            <transition name="test" @after-leave="afterLeave">
              <div v-if="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true },
        methods: {
          afterLeave: spy
        }
      }).$mount(el)

      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(duration / 2).then(() => {
        vm.ok = true
      }).then(() => {
        expect(spy).toHaveBeenCalled()
        expect(vm.$el.children.length).toBe(1) // should have removed leaving element
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      }).then(done)
    })

    it('transition with v-show', done => {
      const vm = new Vue({
        template: `
          <div>
            <transition name="test">
              <div v-show="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.textContent).toBe('foo')
      expect(vm.$el.children[0].style.display).toBe('')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].style.display).toBe('none')
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].style.display).toBe('')
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition with v-show, inside child component', done => {
      const vm = new Vue({
        template: `
          <div>
            <test v-show="ok"></test>
          </div>
        `,
        data: { ok: true },
        components: {
          test: {
            template: `<transition name="test"><div class="test">foo</div></transition>`
          }
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.textContent).toBe('foo')
      expect(vm.$el.children[0].style.display).toBe('')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].style.display).toBe('none')
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].style.display).toBe('')
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('leaveCancelled (v-show only)', done => {
      const spy = jasmine.createSpy('leaveCancelled')
      const vm = new Vue({
        template: `
          <div>
            <transition name="test" @leave-cancelled="leaveCancelled">
              <div v-show="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true },
        methods: {
          leaveCancelled: spy
        }
      }).$mount(el)

      expect(vm.$el.children[0].style.display).toBe('')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(10).then(() => {
        vm.ok = true
      }).then(() => {
        expect(spy).toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].style.display).toBe('')
      }).then(done)
    })

    it('animations', done => {
      const vm = new Vue({
        template: `
          <div>
            <transition name="test-anim">
              <div v-if="ok">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div>foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test-anim-leave test-anim-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test-anim-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test-anim-enter test-anim-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test-anim-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('')
      }).then(done)
    })

    it('explicit transition type', done => {
      const vm = new Vue({
        template: `
          <div>
            <transition name="test-anim-long" type="animation">
              <div v-if="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-long-leave test-anim-long-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-long-leave-active')
      }).thenWaitFor(duration + 5).then(() => {
        // should not end early due to transition presence
        expect(vm.$el.children[0].className).toBe('test test-anim-long-leave-active')
      }).thenWaitFor(duration + 5).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-long-enter test-anim-long-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-long-enter-active')
      }).thenWaitFor(duration + 5).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-long-enter-active')
      }).thenWaitFor(duration + 5).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition on appear', done => {
      const vm = new Vue({
        template: `
          <div>
            <transition name="test"
              appear
              appear-class="test-appear"
              appear-active-class="test-appear-active">
              <div v-if="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true }
      }).$mount(el)

      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-appear test-appear-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-appear-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition on appear with v-show', done => {
      const vm = new Vue({
        template: `
          <div>
            <transition name="test" appear>
              <div v-show="ok" class="test">foo</div>
            </transition>
          </div>
        `,
        data: { ok: true }
      }).$mount(el)

      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition on SVG elements', done => {
      const vm = new Vue({
        template: `
          <svg>
            <transition>
              <circle cx="0" cy="0" r="10" v-if="ok" class="test"></circle>
            </transition>
          </svg>
        `,
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-leave v-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.childNodes.length).toBe(1)
        expect(vm.$el.childNodes[0].nodeType).toBe(8) // should be an empty comment node
        expect(vm.$el.childNodes[0].textContent).toBe('')
        vm.ok = true
      }).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-enter v-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test')
      }).then(done)
    })

    it('transition on child components', done => {
      const vm = new Vue({
        template: `
          <div>
            <transition>
              <test v-if="ok" class="test"></test>
            </transition>
          </div>
        `,
        data: { ok: true },
        components: {
          test: {
            template: `
              <transition name="test">
                <div>foo</div>
              </transition>
            ` // test transition override from parent
          }
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave v-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter v-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition inside child component', done => {
      const vm = new Vue({
        template: `
          <div>
            <test v-if="ok" class="test"></test>
          </div>
        `,
        data: { ok: true },
        components: {
          test: {
            template: `
              <transition>
                <div>foo</div>
              </transition>
            `
          }
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave v-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter v-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('custom transition higher-order component', done => {
      const vm = new Vue({
        template: '<div><my-transition><div v-if="ok" class="test">foo</div></my-transition></div>',
        data: { ok: true },
        components: {
          'my-transition': {
            functional: true,
            render (h, { data, children }) {
              (data.props || (data.props = {})).name = 'test'
              return h('transition', data, children)
            }
          }
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave test-leave-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter test-enter-active')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(duration + 10).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })
  })
}
