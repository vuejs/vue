import { patch } from 'web/runtime/patch'
import VNode from 'core/vdom/vnode'

describe('vdom domProps module', () => {
  it('should create an element with domProps', () => {
    const vnode = new VNode('a', { domProps: { src: 'http://localhost/' }})
    const elm = patch(null, vnode)
    expect(elm.src).toBe('http://localhost/')
  })

  it('should change the elements domProps', () => {
    const vnode1 = new VNode('a', { domProps: { src: 'http://localhost/' }})
    const vnode2 = new VNode('a', { domProps: { src: 'http://vuejs.org/' }})
    patch(null, vnode1)
    const elm = patch(vnode1, vnode2)
    expect(elm.src).toBe('http://vuejs.org/')
  })

  it('should remove the elements domProps', () => {
    const vnode1 = new VNode('a', { domProps: { src: 'http://localhost/' }})
    const vnode2 = new VNode('a', { domProps: {}})
    patch(null, vnode1)
    const elm = patch(vnode1, vnode2)
    expect(elm.src).toBeUndefined()
  })

  it('should initialize the elements value to zero', () => {
    const vnode = new VNode('input', { domProps: { value: 0 }})
    const elm = patch(null, vnode)
    expect(elm.value).toBe('0')
  })
})
