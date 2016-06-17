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

  it('should bind event to a inline method', () => {
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
})
