import Vue from 'vue'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

describe('Functional component memory leak', () => {
  it('should clear devtoolsMeta.renderContext on teardown', () => {
    let renderContext
    const Foo = {
      functional: true,
      render(h, context) {
        renderContext = context
        return h('div', 'hi')
      }
    }
    const vm = new Vue({
      template: `<div><foo /></div>`,
      components: { Foo }
    }).$mount()

    const vnode = vm._vnode.children[0]
    
    // In dev mode, this should be set
    if (vnode.devtoolsMeta && vnode.devtoolsMeta.renderContext) {
        expect(vnode.devtoolsMeta.renderContext).toBe(renderContext)

        // @ts-ignore
        renderContext.teardown()
        expect(vnode.devtoolsMeta.renderContext).toBeNull()
    }
  })

  it('should clear devtoolsMeta.renderContext on teardown for multiple VNodes', () => {
    let renderContext
    const Foo = {
      functional: true,
      render(h, context) {
        renderContext = context
        return [h('div', 'hi'), h('span', 'ho')]
      }
    }
    const vm = new Vue({
      template: `<div><foo /></div>`,
      components: { Foo }
    }).$mount()

    const vnodes = vm._vnode.children[0].children
    
    // In dev mode, this should be set
    if (vnodes[0].devtoolsMeta && vnodes[0].devtoolsMeta.renderContext) {
        expect(vnodes[0].devtoolsMeta.renderContext).toBe(renderContext)
        expect(vnodes[1].devtoolsMeta.renderContext).toBe(renderContext)

        // @ts-ignore
        renderContext.teardown()
        expect(vnodes[0].devtoolsMeta.renderContext).toBeNull()
        expect(vnodes[1].devtoolsMeta.renderContext).toBeNull()
    }
  })

  it('should automatically clear devtoolsMeta.renderContext on component destroy', () => {
    let renderContext
    const Foo = {
      functional: true,
      render(h, context) {
        renderContext = context
        return h('div', 'hi')
      }
    }
    const vm = new Vue({
      template: `<div><foo /></div>`,
      components: { Foo }
    }).$mount()

    const vnode = vm._vnode.children[0]
    
    // In dev mode, this should be set
    if (vnode.devtoolsMeta && vnode.devtoolsMeta.renderContext) {
        // Spy on teardown
        // @ts-ignore
        const spy = vi.spyOn(renderContext, 'teardown')
        
        vm.$destroy()
        
        expect(spy).toHaveBeenCalled()
        expect(vnode.devtoolsMeta.renderContext).toBeNull()
    }
  })
})
