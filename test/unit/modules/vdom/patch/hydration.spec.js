import { patch } from 'web/runtime/patch'
import * as nodeOps from 'web/runtime/node-ops'
import VNode from 'core/vdom/vnode'

describe('hydration', () => {
  let vnode0
  beforeEach(() => {
    vnode0 = new VNode('p', { attrs: { id: '1' }}, [createTextVNode('hello world')])
    patch(null, vnode0)
  })

  it('should hydrate elements when server-rendered DOM tree is same as virtual DOM tree', () => {
    const result = []
    function init (vnode) { result.push(vnode) }
    function createServerRenderedDOM () {
      const root = nodeOps.createElement('div')
      root.setAttribute('server-rendered', 'true')
      const span = nodeOps.createElement('span')
      root.appendChild(span)
      const div = nodeOps.createElement('div')
      const child1 = nodeOps.createElement('span')
      const child2 = nodeOps.createElement('span')
      child1.textContent = 'hi'
      child2.textContent = 'ho'
      div.appendChild(child1)
      div.appendChild(child2)
      root.appendChild(div)
      return root
    }
    const node0 = createServerRenderedDOM()
    const vnode1 = new VNode('div', {}, [
      new VNode('span', {}),
      new VNode('div', { hook: { init }}, [
        new VNode('span', {}, [new VNode(undefined, undefined, undefined, 'hi')]),
        new VNode('span', {}, [new VNode(undefined, undefined, undefined, 'ho')])
      ])
    ])
    patch(node0, vnode1)
    expect(result.length).toBe(1)

    function traverseAndAssert (vnode, element) {
      expect(vnode.elm).toBe(element)
      if (vnode.children) {
        vnode.children.forEach((node, i) => {
          traverseAndAssert(node, element.childNodes[i])
        })
      }
    }
    // ensure vnodes are correctly associated with actual DOM
    traverseAndAssert(vnode1, node0)

    // check update
    const vnode2 = new VNode('div', { props: { id: 'foo' }}, [
      new VNode('span', { props: { id: 'bar' }}),
      new VNode('div', { hook: { init }}, [
        new VNode('span', {}),
        new VNode('span', {})
      ])
    ])
    patch(vnode1, vnode2)
    expect(node0.id).toBe('foo')
    expect(node0.children[0].id).toBe('bar')
  })

  it('should hydrate components when server-rendered DOM tree is same as virtual DOM tree', () => {
    const result = []
    function init (vnode) { result.push(vnode) }
    function createServerRenderedDOM () {
      const root = nodeOps.createElement('vue-component-1')
      root.setAttribute('server-rendered', 'true')
      const span = nodeOps.createElement('span')
      root.appendChild(span)
      const div = nodeOps.createElement('div')
      const child1 = nodeOps.createElement('span')
      const child2 = nodeOps.createElement('span')
      div.appendChild(child1)
      div.appendChild(child2)
      root.appendChild(div)
      return root
    }
    const node0 = createServerRenderedDOM()
    const vnode1 = new VNode('vue-component-1', {}, [
      new VNode('span', {}),
      new VNode('div', { hook: { init }}, [
        new VNode('span', {}),
        new VNode('span', {})
      ])
    ])
    patch(node0, vnode1)
    expect(result.length).toBe(1)
  })

  it('should warn message that virtual DOM tree is not matching when hydrate element', () => {
    function createServerRenderedDOM () {
      const root = nodeOps.createElement('div')
      root.setAttribute('server-rendered', 'true')
      const span = nodeOps.createElement('span')
      root.appendChild(span)
      const div = nodeOps.createElement('div')
      const child1 = nodeOps.createElement('span')
      div.appendChild(child1)
      root.appendChild(div)
      return root
    }
    const node0 = createServerRenderedDOM()
    const vnode1 = new VNode('div', {}, [
      new VNode('span', {}),
      new VNode('div', {}, [
        new VNode('span', {}),
        new VNode('span', {})
      ])
    ])
    patch(node0, vnode1)
    expect('The client-side rendered virtual DOM tree is not matching').toHaveBeenWarned()
  })
})
