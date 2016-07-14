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
    const h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = h('p', {})
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
    const h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = h('my-component', { props: { msg: vm.message }})
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
    const h = bind(createElement, vm)
    const tag = 'custom-tag'
    renderState.activeInstance = vm
    const vnode = h(tag, {})
    expect(vnode.tag).toBe('custom-tag')
    expect(vnode.data).toEqual({})
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
    expect(vnode.componentOptions).toBeUndefined()
  })

  it('render empty vnode with falsy tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = h(null, {})
    expect(vnode).toEqual(emptyVNode())
  })

  it('render vnode with not string tag using createElement', () => {
    const vm = new Vue({
      data: { msg: 'hello world' }
    })
    const h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = h(Vue.extend({ // Component class
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
    const h = bind(createElement, vm)
    h('p', {})
    expect('createElement cannot be called outside of component').toHaveBeenWarned()
  })

  it('render vnode with createElement with children', () => {
    const vm = new Vue({})
    const h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = h('p', void 0, [h('br'), 'hello world', h('br')])
    expect(vnode.children[0].tag).toBe('br')
    expect(vnode.children[1].text).toBe('hello world')
    expect(vnode.children[2].tag).toBe('br')
  })

  it('render vnode with children, omitting data', () => {
    const vm = new Vue({})
    const h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = h('p', [h('br'), 'hello world', h('br')])
    expect(vnode.children[0].tag).toBe('br')
    expect(vnode.children[1].text).toBe('hello world')
    expect(vnode.children[2].tag).toBe('br')
  })

  it('warn message when using non-thunk children for component', () => {
    const vm = new Vue({
      data: { message: 'hello world' },
      components: {
        'my-component': {
          props: ['msg']
        }
      }
    })
    const h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = h('my-component', { props: { msg: vm.message }}, [h('br'), 'hello world', h('br')])
    expect(vnode.componentOptions.children[0].tag).toBe('br')
    expect(vnode.componentOptions.children[1]).toBe('hello world')
    expect(vnode.componentOptions.children[2].tag).toBe('br')
    expect('A component\'s children should be a function').toHaveBeenWarned()
  })

  it('render svg elements with correct namespace', () => {
    const vm = new Vue({})
    const h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = h('svg', [h('a', [h('foo', [h('bar')])])])
    expect(vnode.ns).toBe('svg')
    // should apply ns to children recursively
    expect(vnode.children[0].ns).toBe('svg')
    expect(vnode.children[0].children[0].ns).toBe('svg')
    expect(vnode.children[0].children[0].children[0].ns).toBe('svg')
  })

  it('render MathML elements with correct namespace', () => {
    const vm = new Vue({})
    const h = bind(createElement, vm)
    renderState.activeInstance = vm
    const vnode = h('math', [h('matrix')])
    expect(vnode.ns).toBe('math')
    // should apply ns to children
    expect(vnode.children[0].ns).toBe('math')
    // although not explicitly listed, elements nested under <math>
    // should not be treated as component
    expect(vnode.children[0].componentOptions).toBeUndefined()
  })
})
