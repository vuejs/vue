import { basePatch as patch } from 'web/runtime/patch'
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
      div.appendChild(child1)
      div.appendChild(child2)
      root.appendChild(div)
      return root
    }
    const node0 = createServerRenderedDOM()
    const vnode1 = new VNode('div', {}, [
      new VNode('span', {}),
      new VNode('div', { hook: { init }}, [
        new VNode('span', {}),
        new VNode('span', {})
      ])
    ])
    patch(node0, vnode1)
    expect(result.length).toBe(1)
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
