import Vue from 'vue'
import { patch } from 'web/runtime/patch'
import VNode from 'core/vdom/vnode'
import { isIE9 } from 'web/util/index'

if (!isIE9) {
  describe('trasition module', () => {
    it('should transit with basic transition', () => {
      const vm = new Vue()
      // create
      const vnode1 = new VNode('div', {}, [
        new VNode('p', { transition: { definition: 'expand', appear: true }},
          undefined, undefined, undefined, undefined, vm
        )
      ])
      let elm = patch(null, vnode1)
      expect(elm.childNodes[0].classList.contains('expand-enter')).toBe(true)
      // remove
      const vnode2 = new VNode('div', {})
      elm = patch(vnode1, vnode2)
    })
  })
}
