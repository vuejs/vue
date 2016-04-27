import Vue from 'vue'

function trigger (target, event, process) {
  var e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  if (process) process(e)
  target.dispatchEvent(e)
  return e
}

describe('Directive v-on', () => {
  let spy, spy2

  beforeEach(() => {
    spy = jasmine.createSpy()
    spy2 = jasmine.createSpy()
  })

  it('should bind event to a method', () => {
    const vm = new Vue({
      el: '#app',
      template: '<div v-on:click="foo"></div>',
      methods: { foo: spy }
    })
    const el = vm.$el
    trigger(el, 'click')
    expect(spy.calls.count()).toBe(1)

    const args = spy.calls.allArgs()
    const event = args[0] && args[0][0] || {}
    expect(event.type).toBe('click')
  })

  it('should bind event to a inline method', () => {
    const vm = new Vue({
      el: '#app',
      template: '<div v-on:click="foo(1,2,3,$event)"></div>',
      methods: { foo: spy }
    })
    const el = vm.$el
    trigger(el, 'click')
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
    const vm = new Vue({
      el: '#app',
      template: '<a href="#test" @click.prevent="foo"></a>',
      methods: { foo: spy }
    })
    const el = vm.$el
    trigger(el, 'click')
    expect(spy.calls.count()).toBe(1)
  })

  it('should support stop propagation', () => {
    const vm = new Vue({
      el: '#app',
      template: `
        <div @click.stop="foo"></div>
      `,
      methods: { foo: spy }
    })
    const hash = window.location.hash
    const el = vm.$el
    trigger(el, 'click')
    expect(window.location.hash).toBe(hash)
  })

  it('should support prevent default', () => {
    const vm = new Vue({
      el: '#app',
      template: `
        <div @click="bar">
          <div @click.stop="foo"></div>
        </div>
      `,
      methods: { foo: spy, bar: spy2 }
    })
    const el = vm.$el
    trigger(el.firstChild, 'click')
    expect(spy).toHaveBeenCalled()
    expect(spy2).not.toHaveBeenCalled()
  })

  it('should support capture', () => {
    const vm = new Vue({
      el: '#app',
      template: `
        <div @click.capture.stop="foo">
          <div @click="bar"></div>
        </div>
      `,
      methods: { foo: spy, bar: spy2 }
    })
    const el = vm.$el
    trigger(el.firstChild, 'click')
    expect(spy).toHaveBeenCalled()
    expect(spy2).not.toHaveBeenCalled()
  })

  xit('should bind to a child component', () => {
    Vue.component('bar', {
      template: '<span>Hello</span>'
    })
    const vm = new Vue({
      el: '#app',
      template: '<bar @click="foo"></bar>',
      methods: { foo: spy }
    })
    const el = vm.$el
    trigger(el, 'click')
    expect(spy.calls.count()).toBe(1)
  })
})
