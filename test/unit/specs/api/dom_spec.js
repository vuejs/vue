/**
* We are not testing transition-related stuff here,
* those are tested in transition_spec.js.
*/

var Vue = require('src')
var _ = require('src/util')

describe('DOM API', function () {
  var vm, vm2, parent, target, sibling, empty, spy
  beforeEach(function () {
    spy = jasmine.createSpy('dom')
    parent = document.createElement('div')
    target = document.createElement('div')
    sibling = document.createElement('div')
    empty = document.createElement('div')
    parent.appendChild(target)
    parent.appendChild(sibling)
    var el = document.createElement('div')
    vm = new Vue({ el: el })
    // fragment instance
    var frag = document.createDocumentFragment()
    frag.appendChild(document.createElement('p'))
    frag.appendChild(document.createElement('span'))
    vm2 = new Vue({
      el: frag
    })
  })

  describe('$appendTo', function () {
    it('normal instance', function () {
      vm.$appendTo(parent, spy)
      expect(parent.childNodes.length).toBe(3)
      expect(parent.lastChild).toBe(vm.$el)
      expect(spy.calls.count()).toBe(1)
    })

    it('fragment instance', function () {
      vm2.$appendTo(parent, spy)
      expect(parent.childNodes.length).toBe(6)
      expect(parent.childNodes[2]).toBe(vm2._fragmentStart)
      expect(parent.childNodes[2]).toBe(vm2.$el)
      expect(parent.childNodes[3].tagName).toBe('P')
      expect(parent.childNodes[4].tagName).toBe('SPAN')
      expect(parent.childNodes[5]).toBe(vm2._fragmentEnd)
      expect(spy.calls.count()).toBe(1)
    })
  })

  describe('$prependTo', function () {
    it('normal instance', function () {
      vm.$prependTo(parent, spy)
      expect(parent.childNodes.length).toBe(3)
      expect(parent.firstChild).toBe(vm.$el)
      expect(spy.calls.count()).toBe(1)
      vm.$prependTo(empty, spy)
      expect(empty.childNodes.length).toBe(1)
      expect(empty.firstChild).toBe(vm.$el)
      expect(spy.calls.count()).toBe(2)
    })

    it('fragment instance', function () {
      vm2.$prependTo(parent, spy)
      expect(parent.childNodes.length).toBe(6)
      expect(parent.childNodes[0]).toBe(vm2._fragmentStart)
      expect(parent.childNodes[0]).toBe(vm2.$el)
      expect(parent.childNodes[1].tagName).toBe('P')
      expect(parent.childNodes[2].tagName).toBe('SPAN')
      expect(parent.childNodes[3]).toBe(vm2._fragmentEnd)
      expect(spy.calls.count()).toBe(1)
      // empty
      vm2.$prependTo(empty, spy)
      expect(empty.childNodes.length).toBe(4)
      expect(empty.childNodes[0]).toBe(vm2._fragmentStart)
      expect(empty.childNodes[0]).toBe(vm2.$el)
      expect(empty.childNodes[1].tagName).toBe('P')
      expect(empty.childNodes[2].tagName).toBe('SPAN')
      expect(empty.childNodes[3]).toBe(vm2._fragmentEnd)
      expect(spy.calls.count()).toBe(2)
    })
  })

  describe('$before', function () {
    it('normal instance', function () {
      vm.$before(sibling, spy)
      expect(parent.childNodes.length).toBe(3)
      expect(parent.childNodes[1]).toBe(vm.$el)
      expect(spy.calls.count()).toBe(1)
    })

    it('fragment instance', function () {
      vm2.$before(sibling, spy)
      expect(parent.childNodes.length).toBe(6)
      expect(parent.childNodes[1]).toBe(vm2._fragmentStart)
      expect(parent.childNodes[1]).toBe(vm2.$el)
      expect(parent.childNodes[2].tagName).toBe('P')
      expect(parent.childNodes[3].tagName).toBe('SPAN')
      expect(parent.childNodes[4]).toBe(vm2._fragmentEnd)
      expect(spy.calls.count()).toBe(1)
    })
  })

  describe('$after', function () {
    it('normal instance', function () {
      vm.$after(target, spy)
      expect(parent.childNodes.length).toBe(3)
      expect(parent.childNodes[1]).toBe(vm.$el)
      expect(spy.calls.count()).toBe(1)
    })

    it('normal instance no next sibling', function () {
      vm.$after(sibling, spy)
      expect(parent.childNodes.length).toBe(3)
      expect(parent.lastChild).toBe(vm.$el)
      expect(spy.calls.count()).toBe(1)
    })

    it('fragment instance', function () {
      vm2.$after(target, spy)
      expect(parent.childNodes.length).toBe(6)
      expect(parent.childNodes[1]).toBe(vm2._fragmentStart)
      expect(parent.childNodes[1]).toBe(vm2.$el)
      expect(parent.childNodes[2].tagName).toBe('P')
      expect(parent.childNodes[3].tagName).toBe('SPAN')
      expect(parent.childNodes[4]).toBe(vm2._fragmentEnd)
      expect(spy.calls.count()).toBe(1)
    })

    it('fragment instance no next sibling', function () {
      vm2.$after(sibling, spy)
      expect(parent.childNodes.length).toBe(6)
      expect(parent.childNodes[2]).toBe(vm2._fragmentStart)
      expect(parent.childNodes[2]).toBe(vm2.$el)
      expect(parent.childNodes[3].tagName).toBe('P')
      expect(parent.childNodes[4].tagName).toBe('SPAN')
      expect(parent.childNodes[5]).toBe(vm2._fragmentEnd)
      expect(spy.calls.count()).toBe(1)
    })
  })

  describe('$remove', function () {
    it('normal instance', function () {
      vm.$before(sibling)
      expect(parent.childNodes.length).toBe(3)
      expect(parent.childNodes[1]).toBe(vm.$el)
      vm.$remove(spy)
      expect(parent.childNodes.length).toBe(2)
      expect(parent.childNodes[0]).toBe(target)
      expect(parent.childNodes[1]).toBe(sibling)
      expect(spy.calls.count()).toBe(1)
    })

    it('fragment instance', function () {
      vm2.$before(sibling)
      expect(parent.childNodes.length).toBe(6)
      expect(parent.childNodes[1]).toBe(vm2._fragmentStart)
      expect(parent.childNodes[1]).toBe(vm2.$el)
      expect(parent.childNodes[2].tagName).toBe('P')
      expect(parent.childNodes[3].tagName).toBe('SPAN')
      expect(parent.childNodes[4]).toBe(vm2._fragmentEnd)
      vm2.$remove(spy)
      expect(parent.childNodes.length).toBe(2)
      expect(parent.childNodes[0]).toBe(target)
      expect(parent.childNodes[1]).toBe(sibling)
      expect(spy.calls.count()).toBe(1)
    })

    it('detached', function () {
      vm.$remove(spy)
      expect(spy.calls.count()).toBe(1)
    })
  })

  describe('$nextTick', function () {
    it('should work', function (done) {
      var context
      var called = false
      vm.$nextTick(function () {
        called = true
        context = this
      })
      expect(called).toBe(false)
      _.nextTick(function () {
        expect(called).toBe(true)
        expect(context).toBe(vm)
        done()
      })
    })
  })
})
