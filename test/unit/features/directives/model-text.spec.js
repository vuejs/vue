import Vue from 'vue'
import { isIE9, isAndroid } from 'core/util/env'

describe('Directive v-model text', () => {
  it('should update value both ways', done => {
    const vm = new Vue({
      data: {
        test: 'b'
      },
      template: '<input v-model="test">'
    }).$mount()
    expect(vm.$el.value).toBe('b')
    vm.test = 'a'
    waitForUpdate(() => {
      expect(vm.$el.value).toBe('a')
      vm.$el.value = 'c'
      triggerEvent(vm.$el, 'input')
      expect(vm.test).toBe('c')
    }).then(done)
  })

  it('.lazy modifier', () => {
    const vm = new Vue({
      data: {
        test: 'b'
      },
      template: '<input v-model.lazy="test">'
    }).$mount()
    expect(vm.$el.value).toBe('b')
    expect(vm.test).toBe('b')
    vm.$el.value = 'c'
    triggerEvent(vm.$el, 'input')
    expect(vm.test).toBe('b')
    triggerEvent(vm.$el, 'change')
    expect(vm.test).toBe('c')
  })

  it('.number modifier', () => {
    const vm = new Vue({
      data: {
        test: 1
      },
      template: '<input v-model.number="test">'
    }).$mount()
    expect(vm.test).toBe(1)
    vm.$el.value = '2'
    triggerEvent(vm.$el, 'input')
    // should let strings pass through
    vm.$el.value = 'f'
    triggerEvent(vm.$el, 'input')
    expect(vm.test).toBe('f')
  })

  it('.trim modifier', () => {
    const vm = new Vue({
      data: {
        test: 'hi'
      },
      template: '<input v-model.trim="test">'
    }).$mount()
    expect(vm.test).toBe('hi')
    vm.$el.value = ' what '
    triggerEvent(vm.$el, 'input')
    expect(vm.test).toBe('what')
  })

  if (isIE9) {
    it('IE9 selectionchange', done => {
      const vm = new Vue({
        data: {
          test: 'foo'
        },
        template: '<input v-model="test">'
      }).$mount()
      const input = vm.$el
      input.value = 'bar'
      document.body.appendChild(input)
      input.focus()
      triggerEvent(input, 'selectionchange')
      waitForUpdate(() => {
        expect(vm.test).toBe('bar')
        input.value = 'a'
        triggerEvent(input, 'selectionchange')
        expect(vm.test).toBe('a')
      }).then(done)
    })
  }

  if (!isAndroid) {
    it('compositionevents', function (done) {
      const vm = new Vue({
        data: {
          test: 'foo'
        },
        template: '<input v-model="test">'
      }).$mount()
      const input = vm.$el
      triggerEvent(input, 'compositionstart')
      input.value = 'baz'
      // input before composition unlock should not call set
      triggerEvent(input, 'input')
      expect(vm.test).toBe('foo')
      // after composition unlock it should work
      triggerEvent(input, 'compositionend')
      triggerEvent(input, 'input')
      expect(vm.test).toBe('baz')
      done()
    })
  }

  it('warn inline value attribute', () => {
    const vm = new Vue({
      data: {
        test: 'foo'
      },
      template: '<input v-model="test" value="bar">'
    }).$mount()
    expect(vm.test).toBe('foo')
    expect(vm.$el.value).toBe('foo')
    expect('inline value attributes will be ignored').toHaveBeenWarned()
  })

  it('warn textarea inline content', function () {
    const vm = new Vue({
      data: {
        test: 'foo'
      },
      template: '<textarea v-model="test">bar</textarea>'
    }).$mount()
    expect(vm.test).toBe('foo')
    expect(vm.$el.value).toBe('foo')
    expect('inline content inside <textarea> will be ignored').toHaveBeenWarned()
  })

  it('warn invalid tag', () => {
    new Vue({
      data: {
        test: 'foo'
      },
      template: '<div v-model="test"></div>'
    }).$mount()
    expect('v-model is not supported on element type: <div>').toHaveBeenWarned()
  })

  // #3468
  it('should have higher priority than user v-on events', () => {
    const spy = jasmine.createSpy()
    const vm = new Vue({
      data: {
        a: 'a'
      },
      template: '<input v-model="a" @input="onInput">',
      methods: {
        onInput (e) {
          spy(e.target.value)
        }
      }
    }).$mount()
    vm.$el.value = 'b'
    triggerEvent(vm.$el, 'input')
    expect(spy).toHaveBeenCalledWith('b')
  })

  it('warn binding to v-for alias', () => {
    new Vue({
      data: {
        strings: ['hi']
      },
      template: `
        <div>
          <div v-for="str in strings">
            <input v-model="str">
          </div>
        </div>
      `
    }).$mount()
    expect('You are binding v-model directly to a v-for iteration alias').toHaveBeenWarned()
  })
})
