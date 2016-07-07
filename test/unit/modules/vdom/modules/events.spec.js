import { patch } from 'web/runtime/patch'
import VNode from 'core/vdom/vnode'

describe('vdom events module', () => {
  it('should attach event handler to element', () => {
    const click = jasmine.createSpy()
    const vnode = new VNode('a', { on: { click }})
    const elm = patch(null, vnode)
    document.body.appendChild(elm)
    triggerEvent(elm, 'click')
    expect(click.calls.count()).toBe(1)
  })

  it('should not attach new listener', () => {
    const click = jasmine.createSpy()
    const vnode1 = new VNode('a', { on: { click }})
    const vnode2 = new VNode('a', { on: { click }})
    patch(null, vnode1)
    const elm = patch(vnode1, vnode2)
    document.body.appendChild(elm)
    triggerEvent(elm, 'click')
    expect(click.calls.count()).toBe(1)
  })

  it('should attach event handlers', () => {
    const click = jasmine.createSpy()
    const vnode = new VNode('a', { on: { click: [click, click] }})
    const elm = patch(null, vnode)
    document.body.appendChild(elm)
    triggerEvent(elm, 'click')
    expect(click.calls.count()).toBe(2)
  })

  it('should change attach event handlers', () => {
    const click = jasmine.createSpy()
    const focus = jasmine.createSpy()
    const vnode1 = new VNode('a', { on: { click: [click, focus] }})
    const vnode2 = new VNode('a', { on: { click: [click] }})
    patch(null, vnode1)
    const elm = patch(vnode1, vnode2)
    document.body.appendChild(elm)
    triggerEvent(elm, 'click')
    expect(click.calls.count()).toBe(1)
  })
})
