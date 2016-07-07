import { patch } from 'web/runtime/patch'
import VNode from 'core/vdom/vnode'

describe('vdom props module', () => {
  it('should create an element with props', () => {
    const vnode = new VNode('a', { props: { src: 'http://localhost/' }})
    const elm = patch(null, vnode)
    expect(elm.src).toBe('http://localhost/')
  })

  it('should change the elements props', () => {
    const vnode1 = new VNode('a', { props: { src: 'http://localhost/' }})
    const vnode2 = new VNode('a', { props: { src: 'http://vuejs.org/' }})
    patch(null, vnode1)
    const elm = patch(vnode1, vnode2)
    expect(elm.src).toBe('http://vuejs.org/')
  })

  it('should remove the elements props', () => {
    const vnode1 = new VNode('a', { props: { src: 'http://localhost/' }})
    const vnode2 = new VNode('a', { props: {}})
    patch(null, vnode1)
    const elm = patch(vnode1, vnode2)
    expect(elm.src).toBeUndefined()
  })
})
