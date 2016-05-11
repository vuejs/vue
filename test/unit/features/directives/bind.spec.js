import Vue from 'vue'

describe('Directive v-bind', () => {
  it('normal attr', done => {
    const vm = new Vue({
      template: '<div><span :test="foo">hello</span></div>',
      data: { foo: 'ok' }
    }).$mount()
    expect(vm.$el.firstChild.getAttribute('test')).toBe('ok')
    vm.foo = 'again'
    waitForUpdate(() => {
      expect(vm.$el.firstChild.getAttribute('test')).toBe('again')
      vm.foo = null
    }).then(() => {
      expect(vm.$el.firstChild.hasAttribute('test')).toBe(false)
      vm.foo = false
    }).then(() => {
      expect(vm.$el.firstChild.hasAttribute('test')).toBe(false)
      vm.foo = true
    }).then(() => {
      expect(vm.$el.firstChild.getAttribute('test')).toBe('true')
      vm.foo = 0
    }).then(() => {
      expect(vm.$el.firstChild.getAttribute('test')).toBe('0')
      done()
    }).catch(done)
  })

  it('should set property for input value', done => {
    const vm = new Vue({
      template: `
        <div>
          <input type="text" :value="foo">
          <input type="checkbox" :checked="bar">
        </div>
      `,
      data: {
        foo: 'ok',
        bar: false
      }
    }).$mount()
    expect(vm.$el.firstChild.value).toBe('ok')
    expect(vm.$el.lastChild.checked).toBe(false)
    vm.bar = true
    waitForUpdate(() => {
      expect(vm.$el.lastChild.checked).toBe(true)
      done()
    }).catch(done)
  })

  it('xlink', done => {
    const vm = new Vue({
      template: '<svg><a :xlink:special="foo"></a></svg>',
      data: {
        foo: 'ok'
      }
    }).$mount()
    const xlinkNS = 'http://www.w3.org/1999/xlink'
    expect(vm.$el.firstChild.getAttributeNS(xlinkNS, 'special')).toBe('ok')
    vm.foo = 'again'
    waitForUpdate(() => {
      expect(vm.$el.firstChild.getAttributeNS(xlinkNS, 'special')).toBe('again')
      vm.foo = null
    }).then(() => {
      expect(vm.$el.firstChild.hasAttributeNS(xlinkNS, 'special')).toBe(false)
      vm.foo = true
    }).then(() => {
      expect(vm.$el.firstChild.getAttributeNS(xlinkNS, 'special')).toBe('true')
      done()
    }).catch(done)
  })

  it('enumrated attr', done => {
    const vm = new Vue({
      template: '<div><span :draggable="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(vm.$el.firstChild.getAttribute('draggable')).toBe('true')
    vm.foo = 'again'
    waitForUpdate(() => {
      expect(vm.$el.firstChild.getAttribute('draggable')).toBe('true')
      vm.foo = null
    }).then(() => {
      expect(vm.$el.firstChild.getAttribute('draggable')).toBe('false')
      vm.foo = ''
    }).then(() => {
      expect(vm.$el.firstChild.getAttribute('draggable')).toBe('true')
      vm.foo = false
    }).then(() => {
      expect(vm.$el.firstChild.getAttribute('draggable')).toBe('false')
      vm.foo = 'false'
    }).then(() => {
      expect(vm.$el.firstChild.getAttribute('draggable')).toBe('false')
      done()
    }).catch(done)
  })

  it('boolean attr', done => {
    const vm = new Vue({
      template: '<div><span :disabled="foo">hello</span></div>',
      data: { foo: true }
    }).$mount()
    expect(vm.$el.firstChild.getAttribute('disabled')).toBe('disabled')
    vm.foo = 'again'
    waitForUpdate(() => {
      expect(vm.$el.firstChild.getAttribute('disabled')).toBe('disabled')
      vm.foo = null
    }).then(() => {
      expect(vm.$el.firstChild.hasAttribute('disabled')).toBe(false)
      vm.foo = ''
    }).then(() => {
      expect(vm.$el.firstChild.hasAttribute('disabled')).toBe(true)
      done()
    }).catch(done)
  })
})
