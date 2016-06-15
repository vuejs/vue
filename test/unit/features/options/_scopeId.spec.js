import Vue from 'vue'

describe('Options _scopeId', () => {
  it('should add scopeId attributes', () => {
    const vm = new Vue({
      _scopeId: 'foo',
      template: '<div><p><span></span></p></div>'
    }).$mount()
    expect(vm.$el.hasAttribute('foo')).toBe(true)
    expect(vm.$el.children[0].hasAttribute('foo')).toBe(true)
    expect(vm.$el.children[0].children[0].hasAttribute('foo')).toBe(true)
  })

  it('should add scopedId attributes from both parent and child on child root', () => {
    const vm = new Vue({
      _scopeId: 'foo',
      template: '<div><child></child></div>',
      components: {
        child: {
          _scopeId: 'bar',
          template: '<div></div>'
        }
      }
    }).$mount()
    expect(vm.$el.children[0].hasAttribute('foo')).toBe(true)
    expect(vm.$el.children[0].hasAttribute('bar')).toBe(true)
  })

  it('should add scopedId attributes from both parent and child on slot contents', () => {
    const vm = new Vue({
      _scopeId: 'foo',
      template: '<div><child><p>hi</p></child></div>',
      components: {
        child: {
          _scopeId: 'bar',
          template: '<div><slot></slot></div>'
        }
      }
    }).$mount()
    expect(vm.$el.children[0].children[0].hasAttribute('foo')).toBe(true)
    expect(vm.$el.children[0].children[0].hasAttribute('bar')).toBe(true)
  })
})
