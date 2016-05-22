import { basePatch as patch } from 'web/runtime/patch'
import VNode from 'core/vdom/vnode'

describe('class module', () => {
  it('shuold create an element with staticClass', () => {
    const vnode = new VNode('p', { staticClass: 'class1' })
    const elm = patch(null, vnode)
    expect(elm.classList.contains('class1')).toBe(true)
  })

  it('should create an element with class', () => {
    const vnode = new VNode('p', { class: 'class1' })
    const elm = patch(null, vnode)
    expect(elm.classList.contains('class1')).toBe(true)
  })

  it('should create an element with array class', () => {
    const vnode = new VNode('p', { class: ['class1', 'class2'] })
    const elm = patch(null, vnode)
    expect(elm.classList.contains('class1')).toBe(true)
    expect(elm.classList.contains('class2')).toBe(true)
  })

  it('should create an element with object class', () => {
    const vnode = new VNode('p', {
      class: { class1: true, class2: false, class3: true }
    })
    const elm = patch(null, vnode)
    expect(elm.classList.contains('class1')).toBe(true)
    expect(elm.classList.contains('class2')).toBe(false)
    expect(elm.classList.contains('class3')).toBe(true)
  })

  it('should create an element with mixed class', () => {
    const vnode = new VNode('p', {
      class: [{ class1: false, class2: true, class3: false }, 'class4', ['class5', 'class6']]
    })
    const elm = patch(null, vnode)
    expect(elm.classList.contains('class1')).toBe(false)
    expect(elm.classList.contains('class2')).toBe(true)
    expect(elm.classList.contains('class3')).toBe(false)
    expect(elm.classList.contains('class4')).toBe(true)
    expect(elm.classList.contains('class5')).toBe(true)
    expect(elm.classList.contains('class6')).toBe(true)
  })

  it('should create an element with staticClass and class', () => {
    const vnode = new VNode('p', { staticClass: 'class1', class: 'class2' })
    const elm = patch(null, vnode)
    expect(elm.classList.contains('class1')).toBe(true)
    expect(elm.classList.contains('class2')).toBe(true)
  })

  it('should handle transition class', () => {
    const vnode1 = new VNode('p', {
      class: { class1: true, class2: false, class3: true }
    })
    let elm = patch(null, vnode1)
    elm._transitionClasses = ['class4']
    const vnode2 = new VNode('p', {
      class: { class1: true, class2: true, class3: true }
    })
    elm = patch(vnode1, vnode2)
    expect(elm.classList.contains('class1')).toBe(true)
    expect(elm.classList.contains('class2')).toBe(true)
    expect(elm.classList.contains('class3')).toBe(true)
    expect(elm.classList.contains('class4')).toBe(true)
  })

  it('should change the elements class', () => {
    const vnode1 = new VNode('p', {
      class: { class1: true, class2: false, class3: true }
    })
    const vnode2 = new VNode('p', { staticClass: 'foo bar' })
    let elm = patch(null, vnode1)
    elm = patch(vnode1, vnode2)
    expect(elm.classList.contains('class1')).toBe(false)
    expect(elm.classList.contains('class2')).toBe(false)
    expect(elm.classList.contains('class3')).toBe(false)
    expect(elm.classList.contains('foo')).toBe(true)
    expect(elm.classList.contains('bar')).toBe(true)
  })

  it('should remove the elements class', () => {
    const vnode1 = new VNode('p', {
      class: { class1: true, class2: false, class3: true }
    })
    const vnode2 = new VNode('p', { class: {}})
    let elm = patch(null, vnode1)
    elm = patch(vnode1, vnode2)
    expect(elm.classList.contains('class1')).toBe(false)
    expect(elm.classList.contains('class2')).toBe(false)
    expect(elm.classList.contains('class3')).toBe(false)
  })
})
