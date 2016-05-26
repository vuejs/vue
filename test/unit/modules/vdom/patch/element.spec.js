import { patch } from 'web/runtime/patch'
import VNode from 'core/vdom/vnode'

describe('element', () => {
  it('should create an element', () => {
    const vnode = new VNode('p', { attrs: { id: '1' }}, [createTextVNode('hello world')])
    const elm = patch(null, vnode)
    expect(elm.tagName).toBe('P')
    expect(elm.outerHTML).toBe('<p id="1">hello world</p>')
  })

  it('should create an element which having the namespace', () => {
    const vnode = new VNode('svg', {}, undefined, undefined, undefined, 'svg')
    const elm = patch(null, vnode)
    expect(elm.namespaceURI).toBe('http://www.w3.org/2000/svg')
  })

  it('should create an elements which having text content', () => {
    const vnode = new VNode('div', {}, [createTextVNode('hello world')])
    const elm = patch(null, vnode)
    expect(elm.innerHTML).toBe('hello world')
  })

  it('should create create an elements which having span and text content', () => {
    const vnode = new VNode('div', {}, [
      new VNode('span'),
      createTextVNode('hello world')
    ])
    const elm = patch(null, vnode)
    expect(elm.childNodes[0].tagName).toBe('SPAN')
    expect(elm.childNodes[1].textContent).toBe('hello world')
  })
})
