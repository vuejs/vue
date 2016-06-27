import Vue from 'vue'
import { renderState } from 'core/instance/render'
import {
  renderElement,
  renderElementWithChildren,
  renderStatic
} from 'core/vdom/create-element'
import { emptyVNode } from 'core/vdom/vnode'
import { bind } from 'shared/util'

describe('create-element', () => {
  afterEach(() => {
    renderState.activeInstance = null
  })

  it('render vnode with basic reserved tag using renderElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _e = bind(renderElement, vm)
    renderState.activeInstance = vm
    const vnode = _e('p', {})
    expect(vnode.tag).toBe('p')
    expect(vnode.data).toEqual({})
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('render vnode with component using renderElement', () => {
    const vm = new Vue({
      data: { message: 'hello world' },
      components: {
        'my-component': {
          props: ['msg']
        }
      }
    })
    const _e = bind(renderElement, vm)
    renderState.activeInstance = vm
    const vnode = _e('my-component', { props: { msg: vm.message }})
    expect(vnode.tag).toMatch(/vue-component-[0-9]+/)
    expect(vnode.componentOptions.propsData).toEqual({ msg: vm.message })
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('render vnode with custom tag using renderElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _e = bind(renderElement, vm)
    const tag = 'custom-tag'
    renderState.activeInstance = vm
    const vnode = _e(tag, {})
    expect(vnode.tag).toBe('custom-tag')
    expect(vnode.data).toEqual({})
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
    expect(vnode.componentOptions).toBeUndefined()
    expect(`Unknown custom element: <${tag}> - did you`).toHaveBeenWarned()
  })

  it('render empty vnode with falsy tag using renderElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _e = bind(renderElement, vm)
    renderState.activeInstance = vm
    const vnode = _e(null, {})
    expect(vnode).toEqual(emptyVNode())
  })

  it('render vnode with not string tag using renderElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _e = bind(renderElement, vm)
    renderState.activeInstance = vm
    const vnode = _e(Vue.extend({ // Component class
      props: ['msg']
    }), { props: { msg: vm.message }})
    expect(vnode.tag).toMatch(/vue-component-[0-9]+/)
    expect(vnode.componentOptions.propsData).toEqual({ msg: vm.message })
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('warn message that createElement cannot called when using renderElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _e = bind(renderElement, vm)
    _e('p', {})
    expect('createElement cannot be called outside of component').toHaveBeenWarned()
  })

  it('renderStatic', done => {
    const vm = new Vue({
      template: '<p>hello world</p>'
    }).$mount()
    waitForUpdate(() => {
      const _s = bind(renderStatic, vm)
      const vnode = _s(0)
      expect(vnode.tag).toBe('p')
      expect(vnode.data).toBeUndefined()
      expect(vnode.children[0].text).toBe('hello world')
      expect(vnode.elm.outerHTML).toBe('<p>hello world</p>')
      expect(vnode.ns).toBeUndefined()
      expect(vnode.context).toEqual(vm)
    }).then(done)
  })

  it('render vnode with renderElementWithChildren', () => {
    const vm = new Vue({})
    const _e = bind(renderElement, vm)
    const _h = bind(renderElementWithChildren, vm)
    renderState.activeInstance = vm
    const parent = _e('p', {})
    const children = [_e('br'), 'hello world', _e('br')]
    const vnode = _h(parent, children)
    expect(vnode.children[0].tag).toBe('br')
    expect(vnode.children[1].text).toBe('hello world')
    expect(vnode.children[2].tag).toBe('br')
  })

  it('warn message when use renderElementWithChildren for component', () => {
    const vm = new Vue({
      data: { message: 'hello world' },
      components: {
        'my-component': {
          props: ['msg']
        }
      }
    })
    const _e = bind(renderElement, vm)
    const _h = bind(renderElementWithChildren, vm)
    renderState.activeInstance = vm
    const parent = _e('my-component', { props: { msg: vm.message }})
    const children = [_e('br'), 'hello world', _e('br')]
    const vnode = _h(parent, children)
    expect(vnode.componentOptions.children[0].tag).toBe('br')
    expect(vnode.componentOptions.children[1]).toBe('hello world')
    expect(vnode.componentOptions.children[2].tag).toBe('br')
    expect('A component\'s children should be a function').toHaveBeenWarned()
  })
})
