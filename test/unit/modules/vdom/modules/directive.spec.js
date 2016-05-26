import Vue from 'vue'
import { patch } from 'web/runtime/patch'
import VNode from 'core/vdom/vnode'

describe('directive module', () => {
  it('should work directive', () => {
    const directive1 = {
      bind: jasmine.createSpy('bind'),
      update: jasmine.createSpy('update'),
      unbind: jasmine.createSpy('unbind')
    }
    const vm = new Vue({ directives: { directive1 }})
    // create
    const vnode1 = new VNode('div', {}, [
      new VNode('p', {
        directives: [{
          name: 'directive1', value: 'hello', arg: 'arg1', modifiers: { modifire1: true }
        }]
      }, undefined, 'hello world', undefined, undefined, vm)
    ])
    patch(null, vnode1)
    expect(directive1.bind).toHaveBeenCalled()
    // update
    const vnode2 = new VNode('div', {}, [
      new VNode('p', {
        directives: [{
          name: 'directive1', value: 'world', arg: 'arg1', modifiers: { modifire1: true }
        }]
      }, undefined, 'hello world', undefined, undefined, vm)
    ])
    patch(vnode1, vnode2)
    expect(directive1.update).toHaveBeenCalled()
    // destroy
    const vnode3 = new VNode('div')
    patch(vnode2, vnode3)
    expect(directive1.unbind).toHaveBeenCalled()
  })

  it('should not update when same binding value', () => {
    const directive1 = {
      update: jasmine.createSpy('update')
    }
    const vm = new Vue({ directives: { directive1 }})
    const vnode1 = new VNode('div', {}, [
      new VNode('p', {
        directives: [{
          name: 'directive1', value: 'hello', arg: 'arg1', modifiers: { modifire1: true }
        }]
      }, undefined, 'hello world', undefined, undefined, vm)
    ])
    const vnode2 = new VNode('div', {}, [
      new VNode('p', {
        directives: [{
          name: 'directive1', value: 'hello', arg: 'arg1', modifiers: { modifire1: true }
        }]
      }, undefined, 'hello world', undefined, undefined, vm)
    ])
    patch(null, vnode1)
    patch(vnode1, vnode2)
    expect(directive1.update).not.toHaveBeenCalled()
  })
})
