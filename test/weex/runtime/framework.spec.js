import * as framework from '../../../packages/weex-vue-framework'
import { DEFAULT_ENV, Runtime, Instance } from 'weex-vdom-tester'
import { config } from 'weex-js-runtime'

import {
  syncPromise,
  checkRefresh
} from '../helpers/index'

let sendTasksHandler = () => {}
const { Document, Element, Comment } = config
function sendTasks () {
  sendTasksHandler.apply(null, arguments)
}

describe('framework APIs', () => {
  let runtime

  beforeEach(() => {
    Document.handler = sendTasks
    framework.init({ Document, Element, Comment, sendTasks })
    runtime = new Runtime(framework)
    sendTasksHandler = function () {
      runtime.target.callNative(...arguments)
    }
  })

  afterEach(() => {
    delete Document.handler
    framework.reset()
  })

  it('createInstance', () => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      new Vue({
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: 'Hello' }}, [])
          ])
        },
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text', attr: { value: 'Hello' }}]
    })
  })

  it('createInstance with config', () => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      new Vue({
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: JSON.stringify(this.$getConfig()) }}, [])
          ])
        },
        el: "body"
      })
    `, { bundleUrl: 'http://example.com/', a: 1, b: 2 })
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text', attr: { value: '{"bundleUrl":"http://example.com/","a":1,"b":2}' }}]
    })
  })

  it('createInstance with external data', () => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      new Vue({
        data: {
          a: 1,
          b: 2
        },
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: this.a + '-' + this.b }}, [])
          ])
        },
        el: "body"
      })
    `, undefined, { a: 111 })
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text', attr: { value: '111-2' }}]
    })
  })

  it('destroyInstance', (done) => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      new Vue({
        data: {
          x: 'Hello'
        },
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: this.x }}, [])
          ])
        },
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text', attr: { value: 'Hello' }}]
    })

    syncPromise([
      checkRefresh(instance, { x: 'World' }, result => {
        expect(result).toEqual({
          type: 'div',
          children: [{ type: 'text', attr: { value: 'World' }}]
        })
        framework.destroyInstance(instance.id)
      }),
      checkRefresh(instance, { x: 'Weex' }, result => {
        expect(result).toEqual({
          type: 'div',
          children: [{ type: 'text', attr: { value: 'World' }}]
        })
        done()
      })
    ])
  })

  it('refreshInstance', (done) => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      new Vue({
        data: {
          x: 'Hello'
        },
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: this.x }}, [])
          ])
        },
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text', attr: { value: 'Hello' }}]
    })

    framework.refreshInstance(instance.id, { x: 'World' })
    setTimeout(() => {
      expect(instance.getRealRoot()).toEqual({
        type: 'div',
        children: [{ type: 'text', attr: { value: 'World' }}]
      })

      framework.destroyInstance(instance.id)
      const result = framework.refreshInstance(instance.id, { x: 'Weex' })
      expect(result instanceof Error).toBe(true)
      expect(result).toMatch(/refreshInstance/)
      expect(result).toMatch(/not found/)

      setTimeout(() => {
        expect(instance.getRealRoot()).toEqual({
          type: 'div',
          children: [{ type: 'text', attr: { value: 'World' }}]
        })
        done()
      })
    })
  })

  it('getRoot', () => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      new Vue({
        data: {
          x: 'Hello'
        },
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: this.x }}, [])
          ])
        },
        el: "body"
      })
    `)

    let root = framework.getRoot(instance.id)
    expect(root.ref).toEqual('_root')
    expect(root.type).toEqual('div')
    expect(root.children.length).toEqual(1)
    expect(root.children[0].type).toEqual('text')
    expect(root.children[0].attr).toEqual({ value: 'Hello' })
    framework.destroyInstance(instance.id)

    root = framework.getRoot(instance.id)
    expect(root instanceof Error).toBe(true)
    expect(root).toMatch(/getRoot/)
    expect(root).toMatch(/not found/)
  })

  it('reveiveTasks: fireEvent', (done) => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      new Vue({
        data: {
          x: 'Hello'
        },
        methods: {
          update: function (e) {
            this.x = 'World'
          }
        },
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: this.x }, on: { click: this.update }}, [])
          ])
        },
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{
        type: 'text',
        attr: { value: 'Hello' },
        event: ['click']
      }]
    })

    const textRef = framework.getRoot(instance.id).children[0].ref
    framework.receiveTasks(instance.id, [
      { method: 'fireEvent', args: [textRef, 'click'] }
    ])

    setTimeout(() => {
      expect(instance.getRealRoot()).toEqual({
        type: 'div',
        children: [{
          type: 'text',
          attr: { value: 'World' },
          event: ['click']
        }]
      })

      framework.destroyInstance(instance.id)
      const result = framework.receiveTasks(instance.id, [
        { method: 'fireEvent', args: [textRef, 'click'] }
      ])
      expect(result instanceof Error).toBe(true)
      expect(result).toMatch(/receiveTasks/)
      expect(result).toMatch(/not found/)
      done()
    })
  })

  it('reveiveTasks: callback', (done) => {
    framework.registerModules({
      foo: ['a', 'b', 'c']
    })

    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      const moduleFoo = __weex_require_module__('foo')
      new Vue({
        data: {
          x: 'Hello'
        },
        methods: {
          update: function (data = {}) {
            this.x = data.value || 'World'
          }
        },
        mounted: function () {
          moduleFoo.a(data => {
            this.update(data)
          })
        },
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: this.x }}, [])
          ])
        },
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{
        type: 'text',
        attr: { value: 'Hello' }
      }]
    })

    let callbackId
    instance.history.callNative.some(task => {
      if (task.module === 'foo' && task.method === 'a') {
        callbackId = task.args[0]
        return true
      }
    })
    framework.receiveTasks(instance.id, [
      { method: 'callback', args: [callbackId, undefined, true] }
    ])

    setTimeout(() => {
      expect(instance.getRealRoot()).toEqual({
        type: 'div',
        children: [{
          type: 'text',
          attr: { value: 'World' }
        }]
      })

      framework.receiveTasks(instance.id, [
        { method: 'callback', args: [callbackId, { value: 'Weex' }, true] }
      ])
      setTimeout(() => {
        expect(instance.getRealRoot()).toEqual({
          type: 'div',
          children: [{
            type: 'text',
            attr: { value: 'Weex' }
          }]
        })

        framework.receiveTasks(instance.id, [
          { method: 'callback', args: [callbackId] }
        ])
        setTimeout(() => {
          expect(instance.getRealRoot()).toEqual({
            type: 'div',
            children: [{
              type: 'text',
              attr: { value: 'World' }
            }]
          })

          framework.destroyInstance(instance.id)
          const result = framework.receiveTasks(instance.id, [
            { method: 'callback', args: [callbackId] }
          ])
          expect(result instanceof Error).toBe(true)
          expect(result).toMatch(/receiveTasks/)
          expect(result).toMatch(/not found/)
          done()
        })
      })
    })
  })

  it('registerModules', () => {
    framework.registerModules({
      foo: ['a', 'b', 'c'],
      bar: [
        { name: 'a', args: ['string'] },
        { name: 'b', args: ['number'] },
        { name: 'c', args: ['string', 'number'] }
      ]
    })

    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      const moduleFoo = __weex_require_module__('foo')
      const moduleBar = __weex_require_module__('bar')
      const moduleBaz = __weex_require_module__('baz')
      new Vue({
        render: function (createElement) {
          const value = []
          if (typeof moduleFoo === 'object') {
            value.push('foo')
            value.push(Object.keys(moduleFoo))
          }
          if (typeof moduleBar === 'object') {
            value.push('bar')
            value.push(Object.keys(moduleBar))
          }
          if (typeof moduleBaz === 'object') {
            value.push('baz')
            value.push(Object.keys(moduleBaz))
          }
          return createElement('div', {}, [
            createElement('text', { attrs: { value: value.toString() }}, [])
          ])
        },
        mounted: function () {
          moduleFoo.a(1, '2', true)
          moduleBar.b(1)
        },
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{
        type: 'text',
        attr: { value: 'foo,a,b,c,bar,a,b,c,baz,' }
      }]
    })

    expect(instance.history.callNative
      .filter(task => task.module === 'foo')
      .map(task => `${task.method}(${task.args})`)
    ).toEqual(['a(1,2,true)'])

    expect(instance.history.callNative
      .filter(task => task.module === 'bar')
      .map(task => `${task.method}(${task.args})`)
    ).toEqual(['b(1)'])
  })

  it('registerComponents', () => {
    framework.registerComponents(['foo', { type: 'bar' }, 'text'])
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      new Vue({
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', {}, []),
            createElement('foo', {}, []),
            createElement('bar', {}, []),
            createElement('baz', {}, [])
          ])
        },
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text' }, { type: 'foo' }, { type: 'bar' }, { type: 'baz' }]
    })
  })

  it('vm.$getConfig', () => {
    const instance = new Instance(runtime)
    instance.$create(`
      new Vue({
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: JSON.stringify(this.$getConfig()) }}, [])
          ])
        },
        el: "body"
      })
    `)
    expect(JSON.parse(instance.getRealRoot().children[0].attr.value)).toEqual({ env: DEFAULT_ENV })

    const instance2 = new Instance(runtime)
    instance2.$create(`
      new Vue({
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: JSON.stringify(this.$getConfig()) }}, [])
          ])
        },
        el: "body"
      })
    `, { a: 1, b: 2 })
    expect(JSON.parse(instance2.getRealRoot().children[0].attr.value)).toEqual({ a: 1, b: 2, env: DEFAULT_ENV })
  })

  it('Timer', (done) => {
    const instance = new Instance(runtime)
    instance.$create(`
      new Vue({
        data: {
          x: 0,
          y: 0
        },
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: this.x + '-' + this.y }}, [])
          ])
        },
        mounted: function () {
          const now = Date.now()
          let timer, timer2
          setTimeout(() => {
            this.x = 1
            clearTimeout(timer)
            clearInterval(timer2)
            setInterval(() => {
              this.y++
            }, 600)
          }, 2000)
          timer = setTimeout(() => {
            this.x = 3
          }, 3000)
          setTimeout(() => {
            this.x = 3
          }, 4000)
          timer2 = setInterval(() => {
            this.y++
          }, 900)
        },
        el: "body"
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text', attr: { value: '0-0' }}]
    })

    setTimeout(() => {
      expect(instance.getRealRoot().children[0].attr.value).toEqual('0-1')
    }, 950)
    setTimeout(() => {
      expect(instance.getRealRoot().children[0].attr.value).toEqual('0-2')
    }, 1850)
    setTimeout(() => {
      expect(instance.getRealRoot().children[0].attr.value).toEqual('1-2')
    }, 2050)
    setTimeout(() => {
      expect(instance.getRealRoot().children[0].attr.value).toEqual('1-3')
    }, 2650)
    setTimeout(() => {
      expect(instance.getRealRoot().children[0].attr.value).toEqual('1-4')
    }, 3250)
    setTimeout(() => {
      framework.destroyInstance(instance.id)
    }, 3500)
    setTimeout(() => {
      expect(instance.getRealRoot().children[0].attr.value).toEqual('1-4')
      done()
    }, 4100)
  })

  it('send function param', () => {
    framework.registerModules({
      foo: ['a']
    })

    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      const moduleFoo = __weex_require_module__('foo')
      new Vue({
        mounted: function () {
          moduleFoo.a(a => a + 1)
        },
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: 'Hello' }}, [])
          ])
        },
        el: "body"
      })
    `)

    let callbackId
    instance.history.callNative.some(task => {
      if (task.module === 'foo' && task.method === 'a') {
        callbackId = task.args[0]
        return true
      }
    })

    expect(typeof callbackId).toEqual('string')
  })

  it('send Element param', () => {
    framework.registerModules({
      foo: ['a']
    })

    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      const moduleFoo = __weex_require_module__('foo')
      new Vue({
        mounted: function () {
          moduleFoo.a(this.$refs.x)
        },
        render: function (createElement) {
          return createElement('div', {}, [
            createElement('text', { attrs: { value: 'Hello' }, ref: 'x' }, [])
          ])
        },
        el: "body"
      })
    `)

    let callbackId
    instance.history.callNative.some(task => {
      if (task.module === 'foo' && task.method === 'a') {
        callbackId = task.args[0]
        return true
      }
    })

    expect(typeof callbackId).toEqual('string')
  })

  it('registering global assets', () => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      Vue.component('test', {
        render (h) {
          return h('div', 'Hello')
        }
      })
      new Vue({
        render (h) {
          return h('test')
        },
        el: 'body'
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text', attr: { value: 'Hello' }}]
    })
    // ensure base Vue is unaffected
    expect(framework.Vue.options.components.test).toBeUndefined()
  })

  it('adding prototype methods', () => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      Vue.prototype.$test = () => 'Hello'
      const Test = {
        render (h) {
          return h('div', this.$test())
        }
      }
      new Vue({
        render (h) {
          return h(Test)
        },
        el: 'body'
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text', attr: { value: 'Hello' }}]
    })
    // ensure base Vue is unaffected
    expect(framework.Vue.prototype.$test).toBeUndefined()
  })

  it('using global mixins', () => {
    const instance = new Instance(runtime)
    framework.createInstance(instance.id, `
      Vue.mixin({
        created () {
          this.test = true
        }
      })
      const Test = {
        data: () => ({ test: false }),
        render (h) {
          return h('div', this.test ? 'Hello' : 'nope')
        }
      }
      new Vue({
        data: { test: false },
        render (h) {
          return this.test ? h(Test) : h('p')
        },
        el: 'body'
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [{ type: 'text', attr: { value: 'Hello' }}]
    })
    const vm = new framework.Vue({
      data: { test: false }
    })
    expect(vm.test).toBe(false)
  })
})
