import Vue from 'vue'
import { renderState } from 'core/instance/render'
import { createElement } from 'core/vdom/create-element'
import { emptyVNode } from 'core/vdom/vnode'
import { bind } from 'shared/util'

describe('create-element', () => {
  afterEach(() => {
    renderState.activeInstance = null
  })

  it('render vnode with basic reserved tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = _h('p', {})
    expect(vnode.tag).toBe('p')
    expect(vnode.data).toEqual({})
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('render vnode with component using createElement', () => {
    const vm = new Vue({
      data: { message: 'hello world' },
      components: {
        'my-component': {
          props: ['msg']
        }
      }
    })
    const _h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = _h('my-component', { props: { msg: vm.message }})
    expect(vnode.tag).toMatch(/vue-component-[0-9]+/)
    expect(vnode.componentOptions.propsData).toEqual({ msg: vm.message })
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('render vnode with custom tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _h = bind(createElement, vm)
    const tag = 'custom-tag'
    renderState.activeInstance = vm
    const vnode = _h(tag, {})
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

  it('render empty vnode with falsy tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = _h(null, {})
    expect(vnode).toEqual(emptyVNode())
  })

  it('render vnode with not string tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = _h(Vue.extend({ // Component class
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

  it('warn message that createElement cannot called when using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const _h = bind(createElement, vm)
    _h('p', {})
    expect('createElement cannot be called outside of component').toHaveBeenWarned()
  })

  it('render vnode with createElement with children', () => {
    const vm = new Vue({})
    const _h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = _h('p', void 0, [_h('br'), 'hello world', _h('br')])
    expect(vnode.children[0].tag).toBe('br')
    expect(vnode.children[1].text).toBe('hello world')
    expect(vnode.children[2].tag).toBe('br')
  })

  it('warn message when use createElementWithChildren for component', () => {
    const vm = new Vue({
      data: { message: 'hello world' },
      components: {
        'my-component': {
          props: ['msg']
        }
      }
    })
    const _h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = _h('my-component', { props: { msg: vm.message }}, [_h('br'), 'hello world', _h('br')])
    expect(vnode.componentOptions.children[0].tag).toBe('br')
    expect(vnode.componentOptions.children[1]).toBe('hello world')
    expect(vnode.componentOptions.children[2].tag).toBe('br')
    expect('A component\'s children should be a function').toHaveBeenWarned()
  })
})
