import Vue from 'vue'

describe('Directive v-on', () => {
  let vm, spy, spy2, el

  beforeEach(() => {
    spy = jasmine.createSpy()
    spy2 = jasmine.createSpy()
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  afterEach(() => {
    document.body.removeChild(vm.$el)
  })

  it('should bind event to a method', () => {
    vm = new Vue({
      el,
      template: '<div v-on:click="foo"></div>',
      methods: { foo: spy }
    })
    triggerEvent(vm.$el, 'click')
    expect(spy.calls.count()).toBe(1)

    const args = spy.calls.allArgs()
    const event = args[0] && args[0][0] || {}
    expect(event.type).toBe('click')
  })

  it('should bind event to a inline statement', () => {
    vm = new Vue({
      el,
      template: '<div v-on:click="foo(1,2,3,$event)"></div>',
      methods: { foo: spy }
    })
    triggerEvent(vm.$el, 'click')
    expect(spy.calls.count()).toBe(1)

    const args = spy.calls.allArgs()
    const firstArgs = args[0]
    expect(firstArgs.length).toBe(4)
    expect(firstArgs[0]).toBe(1)
    expect(firstArgs[1]).toBe(2)
    expect(firstArgs[2]).toBe(3)
    expect(firstArgs[3].type).toBe('click')
  })

  it('should support inline function expression', () => {
    const spy = jasmine.createSpy()
    vm = new Vue({
      el,
      template: `<div class="test" @click="function (e) { log(e.target.className) }"></div>`,
      methods: {
        log: spy
      }
    }).$mount()
    triggerEvent(vm.$el, 'click')
    expect(spy).toHaveBeenCalledWith('test')
  })

  it('should support shorthand', () => {
    vm = new Vue({
      el,
      template: '<a href="#test" @click.prevent="foo"></a>',
      methods: { foo: spy }
    })
    triggerEvent(vm.$el, 'click')
    expect(spy.calls.count()).toBe(1)
  })

  it('should support stop propagation', () => {
    vm = new Vue({
      el,
      template: `
        <div @click.stop="foo"></div>
      `,
      methods: { foo: spy }
    })
    const hash = window.location.hash
    triggerEvent(vm.$el, 'click')
    expect(window.location.hash).toBe(hash)
  })

  it('should support prevent default', () => {
    vm = new Vue({
      el,
      template: `
        <div @click="bar">
          <div @click.stop="foo"></div>
        </div>
      `,
      methods: { foo: spy, bar: spy2 }
    })
    triggerEvent(vm.$el.firstChild, 'click')
    expect(spy).toHaveBeenCalled()
    expect(spy2).not.toHaveBeenCalled()
  })

  it('should support capture', () => {
    const callOrder = []
    vm = new Vue({
      el,
      template: `
        <div @click.capture="foo">
          <div @click="bar"></div>
        </div>
      `,
      methods: {
        foo () { callOrder.push(1) },
        bar () { callOrder.push(2) }
      }
    })
    triggerEvent(vm.$el.firstChild, 'click')
    expect(callOrder.toString()).toBe('1,2')
  })

  it('should support once', () => {
    vm = new Vue({
      el,
      template: `
        <div @click.once="foo">
        </div>
      `,
      methods: { foo: spy }
    })
    triggerEvent(vm.$el, 'click')
    expect(spy.calls.count()).toBe(1)
    triggerEvent(vm.$el, 'click')
    expect(spy.calls.count()).toBe(1) // should no longer trigger
  })

  // #4655
  it('should handle .once on multiple elements properly', () => {
    vm = new Vue({
      el,
      template: `
        <div>
          <button ref="one" @click.once="foo">one</button>
          <button ref="two" @click.once="foo">two</button>
        </div>
      `,
      methods: { foo: spy }
    })
    triggerEvent(vm.$refs.one, 'click')
    expect(spy.calls.count()).toBe(1)
    triggerEvent(vm.$refs.one, 'click')
    expect(spy.calls.count()).toBe(1)
    triggerEvent(vm.$refs.two, 'click')
    expect(spy.calls.count()).toBe(2)
    triggerEvent(vm.$refs.one, 'click')
    triggerEvent(vm.$refs.two, 'click')
    expect(spy.calls.count()).toBe(2)
  })

  it('should support capture and once', () => {
    const callOrder = []
    vm = new Vue({
      el,
      template: `
        <div @click.capture.once="foo">
          <div @click="bar"></div>
        </div>
      `,
      methods: {
        foo () { callOrder.push(1) },
        bar () { callOrder.push(2) }
      }
    })
    triggerEvent(vm.$el.firstChild, 'click')
    expect(callOrder.toString()).toBe('1,2')
    triggerEvent(vm.$el.firstChild, 'click')
    expect(callOrder.toString()).toBe('1,2,2')
  })

  // #4846
  it('should support once and other modifiers', () => {
    vm = new Vue({
      el,
      template: `<div @click.once.self="foo"><span/></div>`,
      methods: { foo: spy }
    })
    triggerEvent(vm.$el.firstChild, 'click')
    expect(spy).not.toHaveBeenCalled()
    triggerEvent(vm.$el, 'click')
    expect(spy).toHaveBeenCalled()
    triggerEvent(vm.$el, 'click')
    expect(spy.calls.count()).toBe(1)
  })

  it('should support keyCode', () => {
    vm = new Vue({
      el,
      template: `<input @keyup.enter="foo">`,
      methods: { foo: spy }
    })
    triggerEvent(vm.$el, 'keyup', e => {
      e.keyCode = 13
    })
    expect(spy).toHaveBeenCalled()
  })

  it('should support number keyCode', () => {
    vm = new Vue({
      el,
      template: `<input @keyup.13="foo">`,
      methods: { foo: spy }
    })
    triggerEvent(vm.$el, 'keyup', e => {
      e.keyCode = 13
    })
    expect(spy).toHaveBeenCalled()
  })

  it('should support mouse modifier', () => {
    const left = 0
    const middle = 1
    const right = 2
    const spyLeft = jasmine.createSpy()
    const spyMiddle = jasmine.createSpy()
    const spyRight = jasmine.createSpy()

    vm = new Vue({
      el,
      template: `
        <div>
          <div ref="left" @mousedown.left="foo">left</div>
          <div ref="right" @mousedown.right="foo1">right</div>
          <div ref="middle" @mousedown.middle="foo2">right</div>
        </div>
      `,
      methods: {
        foo: spyLeft,
        foo1: spyRight,
        foo2: spyMiddle
      }
    })

    triggerEvent(vm.$refs.left, 'mousedown', e => { e.button = right })
    triggerEvent(vm.$refs.left, 'mousedown', e => { e.button = middle })
    expect(spyLeft).not.toHaveBeenCalled()
    triggerEvent(vm.$refs.left, 'mousedown', e => { e.button = left })
    expect(spyLeft).toHaveBeenCalled()

    triggerEvent(vm.$refs.right, 'mousedown', e => { e.button = left })
    triggerEvent(vm.$refs.right, 'mousedown', e => { e.button = middle })
    expect(spyRight).not.toHaveBeenCalled()
    triggerEvent(vm.$refs.right, 'mousedown', e => { e.button = right })
    expect(spyRight).toHaveBeenCalled()

    triggerEvent(vm.$refs.middle, 'mousedown', e => { e.button = left })
    triggerEvent(vm.$refs.middle, 'mousedown', e => { e.button = right })
    expect(spyMiddle).not.toHaveBeenCalled()
    triggerEvent(vm.$refs.middle, 'mousedown', e => { e.button = middle })
    expect(spyMiddle).toHaveBeenCalled()
  })

  it('should support custom keyCode', () => {
    Vue.config.keyCodes.test = 1
    vm = new Vue({
      el,
      template: `<input @keyup.test="foo">`,
      methods: { foo: spy }
    })
    triggerEvent(vm.$el, 'keyup', e => {
      e.keyCode = 1
    })
    expect(spy).toHaveBeenCalled()
    Vue.config.keyCodes = Object.create(null)
  })

  it('should override build-in keyCode', () => {
    Vue.config.keyCodes.up = [1, 87]
    vm = new Vue({
      el,
      template: `<input @keyup.up="foo" @keyup.down="foo">`,
      methods: { foo: spy }
    })
    triggerEvent(vm.$el, 'keyup', e => {
      e.keyCode = 87
    })
    expect(spy).toHaveBeenCalled()
    triggerEvent(vm.$el, 'keyup', e => {
      e.keyCode = 1
    })
    expect(spy).toHaveBeenCalledTimes(2)
    // should not affect build-in down keycode
    triggerEvent(vm.$el, 'keyup', e => {
      e.keyCode = 40
    })
    expect(spy).toHaveBeenCalledTimes(3)
    Vue.config.keyCodes = Object.create(null)
  })

  it('should bind to a child component', () => {
    Vue.component('bar', {
      template: '<span>Hello</span>'
    })
    vm = new Vue({
      el,
      template: '<bar @custom="foo"></bar>',
      methods: { foo: spy }
    })
    vm.$children[0].$emit('custom', 'foo', 'bar')
    expect(spy).toHaveBeenCalledWith('foo', 'bar')
  })

  it('should be able to bind native events for a child component', () => {
    Vue.component('bar', {
      template: '<span>Hello</span>'
    })
    vm = new Vue({
      el,
      template: '<bar @click.native="foo"></bar>',
      methods: { foo: spy }
    })
    vm.$children[0].$emit('click')
    expect(spy).not.toHaveBeenCalled()
    triggerEvent(vm.$children[0].$el, 'click')
    expect(spy).toHaveBeenCalled()
  })

  it('.once modifier should work with child components', () => {
    Vue.component('bar', {
      template: '<span>Hello</span>'
    })
    vm = new Vue({
      el,
      template: '<bar @custom.once="foo"></bar>',
      methods: { foo: spy }
    })
    vm.$children[0].$emit('custom')
    expect(spy.calls.count()).toBe(1)
    vm.$children[0].$emit('custom')
    expect(spy.calls.count()).toBe(1) // should not be called again
  })

  it('remove listener', done => {
    const spy2 = jasmine.createSpy('remove listener')
    vm = new Vue({
      el,
      methods: { foo: spy, bar: spy2 },
      data: {
        ok: true
      },
      render (h) {
        return this.ok
          ? h('input', { on: { click: this.foo }})
          : h('input', { on: { input: this.bar }})
      }
    })
    triggerEvent(vm.$el, 'click')
    expect(spy.calls.count()).toBe(1)
    expect(spy2.calls.count()).toBe(0)
    vm.ok = false
    waitForUpdate(() => {
      triggerEvent(vm.$el, 'click')
      expect(spy.calls.count()).toBe(1) // should no longer trigger
      triggerEvent(vm.$el, 'input')
      expect(spy2.calls.count()).toBe(1)
    }).then(done)
  })

  it('remove capturing listener', done => {
    const spy2 = jasmine.createSpy('remove listener')
    vm = new Vue({
      el,
      methods: { foo: spy, bar: spy2, stopped (ev) { ev.stopPropagation() } },
      data: {
        ok: true
      },
      render (h) {
        return this.ok
          ? h('div', { on: { '!click': this.foo }}, [h('div', { on: { click: this.stopped }})])
          : h('div', { on: { mouseOver: this.bar }}, [h('div')])
      }
    })
    triggerEvent(vm.$el.firstChild, 'click')
    expect(spy.calls.count()).toBe(1)
    expect(spy2.calls.count()).toBe(0)
    vm.ok = false
    waitForUpdate(() => {
      triggerEvent(vm.$el.firstChild, 'click')
      expect(spy.calls.count()).toBe(1) // should no longer trigger
      triggerEvent(vm.$el, 'mouseOver')
      expect(spy2.calls.count()).toBe(1)
    }).then(done)
  })

  it('remove once listener', done => {
    const spy2 = jasmine.createSpy('remove listener')
    vm = new Vue({
      el,
      methods: { foo: spy, bar: spy2 },
      data: {
        ok: true
      },
      render (h) {
        return this.ok
          ? h('input', { on: { '~click': this.foo }})
          : h('input', { on: { input: this.bar }})
      }
    })
    triggerEvent(vm.$el, 'click')
    expect(spy.calls.count()).toBe(1)
    triggerEvent(vm.$el, 'click')
    expect(spy.calls.count()).toBe(1) // should no longer trigger
    expect(spy2.calls.count()).toBe(0)
    vm.ok = false
    waitForUpdate(() => {
      triggerEvent(vm.$el, 'click')
      expect(spy.calls.count()).toBe(1) // should no longer trigger
      triggerEvent(vm.$el, 'input')
      expect(spy2.calls.count()).toBe(1)
    }).then(done)
  })

  it('remove capturing and once listener', done => {
    const spy2 = jasmine.createSpy('remove listener')
    vm = new Vue({
      el,
      methods: { foo: spy, bar: spy2, stopped (ev) { ev.stopPropagation() } },
      data: {
        ok: true
      },
      render (h) {
        return this.ok
          ? h('div', { on: { '~!click': this.foo }}, [h('div', { on: { click: this.stopped }})])
          : h('div', { on: { mouseOver: this.bar }}, [h('div')])
      }
    })
    triggerEvent(vm.$el.firstChild, 'click')
    expect(spy.calls.count()).toBe(1)
    triggerEvent(vm.$el.firstChild, 'click')
    expect(spy.calls.count()).toBe(1) // should no longer trigger
    expect(spy2.calls.count()).toBe(0)
    vm.ok = false
    waitForUpdate(() => {
      triggerEvent(vm.$el.firstChild, 'click')
      expect(spy.calls.count()).toBe(1) // should no longer trigger
      triggerEvent(vm.$el, 'mouseOver')
      expect(spy2.calls.count()).toBe(1)
    }).then(done)
  })

  it('remove listener on child component', done => {
    const spy2 = jasmine.createSpy('remove listener')
    vm = new Vue({
      el,
      methods: { foo: spy, bar: spy2 },
      data: {
        ok: true
      },
      components: {
        test: {
          template: '<div></div>'
        }
      },
      render (h) {
        return this.ok
          ? h('test', { on: { foo: this.foo }})
          : h('test', { on: { bar: this.bar }})
      }
    })
    vm.$children[0].$emit('foo')
    expect(spy.calls.count()).toBe(1)
    expect(spy2.calls.count()).toBe(0)
    vm.ok = false
    waitForUpdate(() => {
      vm.$children[0].$emit('foo')
      expect(spy.calls.count()).toBe(1) // should no longer trigger
      vm.$children[0].$emit('bar')
      expect(spy2.calls.count()).toBe(1)
    }).then(done)
  })

  it('warn missing handlers', () => {
    vm = new Vue({
      el,
      data: { none: null },
      template: `<div @click="none"></div>`
    })
    expect(`Invalid handler for event "click": got null`).toHaveBeenWarned()
    expect(() => {
      triggerEvent(vm.$el, 'click')
    }).not.toThrow()
  })

  // Github Issue #5046
  it('should support keyboard modifier', () => {
    const spyLeft = jasmine.createSpy()
    const spyRight = jasmine.createSpy()
    const spyUp = jasmine.createSpy()
    const spyDown = jasmine.createSpy()
    vm = new Vue({
      el,
      template: `
        <div>
          <input ref="left" @keydown.left="foo"></input>
          <input ref="right" @keydown.right="foo1"></input>
          <input ref="up" @keydown.up="foo2"></input>
          <input ref="down" @keydown.down="foo3"></input>
        </div>
      `,
      methods: {
        foo: spyLeft,
        foo1: spyRight,
        foo2: spyUp,
        foo3: spyDown
      }
    })
    triggerEvent(vm.$refs.left, 'keydown', e => { e.keyCode = 37 })
    triggerEvent(vm.$refs.left, 'keydown', e => { e.keyCode = 39 })

    triggerEvent(vm.$refs.right, 'keydown', e => { e.keyCode = 39 })
    triggerEvent(vm.$refs.right, 'keydown', e => { e.keyCode = 38 })

    triggerEvent(vm.$refs.up, 'keydown', e => { e.keyCode = 38 })
    triggerEvent(vm.$refs.up, 'keydown', e => { e.keyCode = 37 })

    triggerEvent(vm.$refs.down, 'keydown', e => { e.keyCode = 40 })
    triggerEvent(vm.$refs.down, 'keydown', e => { e.keyCode = 39 })

    expect(spyLeft.calls.count()).toBe(1)
    expect(spyRight.calls.count()).toBe(1)
    expect(spyUp.calls.count()).toBe(1)
    expect(spyDown.calls.count()).toBe(1)
  })
})
