import Vue from 'vue'
import { createComponent } from 'core/vdom/create-component'
import { setCurrentRenderingInstance } from 'core/instance/render'

describe('create-component', () => {
  let vm
  beforeEach(done => {
    vm = new Vue({
      template: '<p>{{msg}}</p>',
      data () {
        return { msg: 'hello, my children' }
      }
    }).$mount()
    Vue.nextTick(done)
  })

  it('create a component basically', () => {
    const child = {
      name: 'child',
      props: ['msg'],
      render () {}
    }
    const data = {
      props: { msg: 'hello world' },
      attrs: { id: 1 },
      staticAttrs: { class: 'foo' },
      on: { notify: 'onNotify' }
    }
    const vnode = createComponent(child, data, vm, vm)
    expect(vnode.tag).toMatch(/vue-component-[0-9]+-child/)
    expect(vnode.data.attrs).toEqual({ id: 1 })
    expect(vnode.data.staticAttrs).toEqual({ class: 'foo' })
    expect(vnode.componentOptions.propsData).toEqual({ msg: 'hello world' })
    expect(vnode.componentOptions.listeners).toEqual({ notify: 'onNotify' })
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
  })

  it('create a component when resolved with async loading', done => {
    let vnode = null
    const data = {
      props: {},
      staticAttrs: { class: 'foo' }
    }
    spyOn(vm, '$forceUpdate')
    function async (resolve, reject) {
      setTimeout(() => {
        resolve({
          name: 'child',
          props: ['msg']
        })
        Vue.nextTick(loaded)
      }, 0)
    }
    function go () {
      setCurrentRenderingInstance(vm)
      vnode = createComponent(async, data, vm, vm)
      setCurrentRenderingInstance(null)
      expect(vnode.isComment).toBe(true) // not to be loaded yet.
      expect(vnode.asyncFactory).toBe(async)
      expect(vnode.asyncFactory.owners.length).toEqual(1)
    }
    function loaded () {
      setCurrentRenderingInstance(vm)
      vnode = createComponent(async, data, vm, vm)
      setCurrentRenderingInstance(null)
      expect(vnode.tag).toMatch(/vue-component-[0-9]+-child/)
      expect(vnode.data.staticAttrs).toEqual({ class: 'foo' })
      expect(vnode.children).toBeUndefined()
      expect(vnode.text).toBeUndefined()
      expect(vnode.elm).toBeUndefined()
      expect(vnode.ns).toBeUndefined()
      expect(vnode.context).toEqual(vm)
      expect(vnode.asyncFactory.owners.length).toEqual(0)
      expect(vm.$forceUpdate).toHaveBeenCalled()
      done()
    }
    go()
  })

  it('create a component when resolved with synchronous async loading', done => {
    const data = {
      props: {},
      staticAttrs: { class: 'bar' }
    }
    spyOn(vm, '$forceUpdate')
    function async (resolve, reject) {
      resolve({
        name: 'child',
        props: ['msg']
      })
    }
    setCurrentRenderingInstance(vm)
    const vnode = createComponent(async, data, vm, vm)
    setCurrentRenderingInstance(null)
    expect(vnode.asyncFactory).toBe(async)
    expect(vnode.asyncFactory.owners.length).toEqual(0)
    expect(vnode.tag).toMatch(/vue-component-[0-9]+-child/)
    expect(vnode.data.staticAttrs).toEqual({ class: 'bar' })
    expect(vnode.children).toBeUndefined()
    expect(vnode.text).toBeUndefined()
    expect(vnode.elm).toBeUndefined()
    expect(vnode.ns).toBeUndefined()
    expect(vnode.context).toEqual(vm)
    expect(vm.$forceUpdate).not.toHaveBeenCalled()
    done()
  })

  it('not create a component when rejected with async loading', done => {
    let vnode = null
    const data = {
      props: { msg: 'hello world' },
      attrs: { id: 1 }
    }
    const reason = 'failed!!'
    function async (resolve, reject) {
      setTimeout(() => {
        reject(reason)
        Vue.nextTick(failed)
      }, 0)
    }
    function go () {
      setCurrentRenderingInstance(vm)
      vnode = createComponent(async, data, vm, vm)
      setCurrentRenderingInstance(null)
      expect(vnode.isComment).toBe(true) // not to be loaded yet.
    }
    function failed () {
      setCurrentRenderingInstance(vm)
      vnode = createComponent(async, data, vm, vm)
      setCurrentRenderingInstance(null)
      expect(vnode.isComment).toBe(true) // failed, still a comment node
      expect(`Failed to resolve async component: ${async}\nReason: ${reason}`).toHaveBeenWarned()
      done()
    }
    go()
  })

  it('not create a component when specified with falsy', () => {
    const vnode = createComponent(null, {}, vm, vm)
    expect(vnode).toBeUndefined()
  })

  it('warn component definition type', () => {
    const Ctor = 'child'
    const vnode = createComponent(Ctor, {}, vm, vm)
    expect(vnode).toBeUndefined()
    expect(`Invalid Component definition: ${Ctor}`).toHaveBeenWarned()
  })
})
