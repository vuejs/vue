/**
 * We are not testing transition-related stuff here,
 * those are tested in transition_spec.js.
 */

var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')

if (_.inBrowser) {
  describe('DOM API', function () {

    var vm1, vm2, parent, target, sibling, empty
    beforeEach(function () {
      parent = document.createElement('div')
      target = document.createElement('div')
      sibling = document.createElement('div')
      empty = document.createElement('div')
      parent.appendChild(target)
      parent.appendChild(sibling)
      var el = document.createElement('div')
      vm = new Vue({ el: el })
      // block instance
      var frag = document.createDocumentFragment()
      frag.appendChild(document.createElement('p'))
      frag.appendChild(document.createElement('span'))
      vm2 = new Vue({
        el: frag
      })
    })
    
    describe('$appendTo', function () {
      
      it('normal instance', function () {
        vm.$appendTo(parent)
        expect(parent.childNodes.length).toBe(3)
        expect(parent.lastChild).toBe(vm.$el)
      })

      it('block instance', function () {
        vm2.$appendTo(parent)
        expect(parent.childNodes.length).toBe(6)
        expect(parent.childNodes[2]).toBe(vm2.$el)
        expect(parent.childNodes[3].tagName).toBe('P')
        expect(parent.childNodes[4].tagName).toBe('SPAN')
        expect(parent.lastChild).toBe(vm2._blockEnd)
      })

    })

    describe('$prependTo', function () {
      
      it('normal instance', function () {
        vm.$prependTo(parent)
        expect(parent.childNodes.length).toBe(3)
        expect(parent.firstChild).toBe(vm.$el)
        vm.$prependTo(empty)
        expect(empty.childNodes.length).toBe(1)
        expect(empty.firstChild).toBe(vm.$el)
      })

      it('block instance', function () {
        vm2.$prependTo(parent)
        expect(parent.childNodes.length).toBe(6)
        expect(parent.childNodes[0]).toBe(vm2.$el)
        expect(parent.childNodes[1].tagName).toBe('P')
        expect(parent.childNodes[2].tagName).toBe('SPAN')
        expect(parent.childNodes[3]).toBe(vm2._blockEnd)
        // empty
        vm2.$prependTo(empty)
        expect(empty.childNodes.length).toBe(4)
        expect(empty.childNodes[0]).toBe(vm2.$el)
        expect(empty.childNodes[1].tagName).toBe('P')
        expect(empty.childNodes[2].tagName).toBe('SPAN')
        expect(empty.childNodes[3]).toBe(vm2._blockEnd)
      })

    })

    describe('$before', function () {
      
      it('normal instance', function () {
        vm.$before(sibling)
        expect(parent.childNodes.length).toBe(3)
        expect(parent.childNodes[1]).toBe(vm.$el)
      })

      it('block instance', function () {
        vm2.$before(sibling)
        expect(parent.childNodes.length).toBe(6)
        expect(parent.childNodes[1]).toBe(vm2.$el)
        expect(parent.childNodes[2].tagName).toBe('P')
        expect(parent.childNodes[3].tagName).toBe('SPAN')
        expect(parent.childNodes[4]).toBe(vm2._blockEnd)
      })

    })

    describe('$after', function () {
      
      it('normal instance', function () {
        vm.$after(target)
        expect(parent.childNodes.length).toBe(3)
        expect(parent.childNodes[1]).toBe(vm.$el)
      })

      it('block instance', function () {
        vm2.$after(target)
        expect(parent.childNodes.length).toBe(6)
        expect(parent.childNodes[1]).toBe(vm2.$el)
        expect(parent.childNodes[2].tagName).toBe('P')
        expect(parent.childNodes[3].tagName).toBe('SPAN')
        expect(parent.childNodes[4]).toBe(vm2._blockEnd)
      })

    })

    describe('$remove', function () {
      
      it('normal instance', function () {
        vm.$before(sibling)
        expect(parent.childNodes.length).toBe(3)
        expect(parent.childNodes[1]).toBe(vm.$el)
        vm.$remove()
        expect(parent.childNodes.length).toBe(2)
        expect(parent.childNodes[0]).toBe(target)
        expect(parent.childNodes[1]).toBe(sibling)
      })

      it('block instance', function () {
        vm2.$before(sibling)
        expect(parent.childNodes.length).toBe(6)
        expect(parent.childNodes[1]).toBe(vm2.$el)
        expect(parent.childNodes[2].tagName).toBe('P')
        expect(parent.childNodes[3].tagName).toBe('SPAN')
        expect(parent.childNodes[4]).toBe(vm2._blockEnd)
        vm2.$remove()
        expect(parent.childNodes.length).toBe(2)
        expect(parent.childNodes[0]).toBe(target)
        expect(parent.childNodes[1]).toBe(sibling)
      })

    })

  })
}