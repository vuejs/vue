/**
 * Test property proxy, scope inheritance,
 * data event propagation and data sync
 */

var Vue = require('../../src/vue')
var Observer = require('../../src/observe/observer')
var u = undefined
Observer.pathDelimiter = '.'

describe('Scope', function () {
  
  describe('basic', function () {
    
    var vm = new Vue({
      data: {
        a: 1,
        b: {
          c: 2
        }
      }
    })

    it('should copy over data properties', function () {
      expect(vm.$scope.a).toBe(vm.$data.a)
      expect(vm.$scope.b).toBe(vm.$data.b)
    })

    it('should proxy these properties', function () {
      expect(vm.a).toBe(vm.$scope.a)
      expect(vm.b).toBe(vm.$scope.b)
    })

    it('should trigger set events', function () {
      var spy = jasmine.createSpy('basic')
      vm._observer.on('set', spy)

      // set on scope
      vm.$scope.a = 2
      expect(spy.callCount).toBe(1)
      expect(spy).toHaveBeenCalledWith('a', 2, u)

      // set on vm
      vm.b.c = 3
      expect(spy.callCount).toBe(2)
      expect(spy).toHaveBeenCalledWith('b.c', 3, u)
    })

    it('should trigger add/delete events', function () {
      var spy = jasmine.createSpy('instantiation')
      vm._observer
        .on('add', spy)
        .on('delete', spy)

      // add on scope
      vm.$scope.$add('c', 123)
      expect(spy.callCount).toBe(1)
      expect(spy).toHaveBeenCalledWith('c', 123, u)

      // delete on scope
      vm.$scope.$delete('c')
      expect(spy.callCount).toBe(2)
      expect(spy).toHaveBeenCalledWith('c', u, u)

      // vm $add/$delete are tested in the api suite
    })

  })

  describe('data sync', function () {

    var data = {
      a: 1,
      b: {
        c: 2
      }
    }
    
    var vm = new Vue({
      syncData: true,
      data: data
    })

    it('should retain data reference', function () {
      expect(vm.$data).toBe(data)
    })

    it('should sync set', function () {
      // vm -> data
      vm.a = 2
      expect(data.a).toBe(2)
      // data -> vm
      data.b = {d:3}
      expect(vm.$scope.b).toBe(data.b)
      expect(vm.b).toBe(data.b)
    })

    it('should sync add', function () {
      // vm -> data
      vm.$scope.$add('c', 123)
      expect(data.c).toBe(123)
      // data -> vm
      data.$add('d', 456)
      expect(vm.$scope.d).toBe(456)
      expect(vm.d).toBe(456)
    })

    it('should sync delete', function () {
      // vm -> data
      vm.$scope.$delete('d')
      expect(data.hasOwnProperty('d')).toBe(false)
      // data -> vm
      data.$delete('c')
      expect(vm.$scope.hasOwnProperty('c')).toBe(false)
      expect(vm.hasOwnProperty('c')).toBe(false)
    })

  })

  describe('inheritance', function () {
    
    var parent = new Vue({
      data: {
        a: 'parent a',
        b: { c: 2 },
        c: 'parent c',
        arr: [{a:1},{a:2}]
      }
    })

    var child = new Vue({
      parent: parent,
      data: {
        a: 'child a'
      }
    })

    it('child should inherit parent data on scope', function () {
      expect(child.$scope.b).toBe(parent.b) // object
      expect(child.$scope.c).toBe(parent.c) // primitive value
    })

    it('child should not ineherit data on instance', function () {
      expect(child.b).toBeUndefined()
      expect(child.c).toBeUndefined()
    })

    it('child should shadow parent property with same key', function () {
      expect(parent.a).toBe('parent a')
      expect(child.$scope.a).toBe('child a')
      expect(child.a).toBe('child a')
    })

    it('setting scope properties on child should affect parent', function () {
      child.$scope.c = 'modified by child'
      expect(parent.c).toBe('modified by child')
    })

    it('events on parent should propagate down to child', function () {
      // when a shadowed property changed on parent scope,
      // the event should NOT be propagated down
      var spy = jasmine.createSpy('inheritance')
      child._observer.on('set', spy)
      parent.c = 'c changed'
      expect(spy.callCount).toBe(1)
      expect(spy).toHaveBeenCalledWith('c', 'c changed', u)

      spy = jasmine.createSpy('inheritance')
      child._observer.on('add', spy)
      parent.$scope.$add('e', 123)
      expect(spy.callCount).toBe(1)
      expect(spy).toHaveBeenCalledWith('e', 123, u)

      spy = jasmine.createSpy('inheritance')
      child._observer.on('delete', spy)
      parent.$scope.$delete('e')
      expect(spy.callCount).toBe(1)
      expect(spy).toHaveBeenCalledWith('e', u, u)

      spy = jasmine.createSpy('inheritance')
      child._observer.on('mutate', spy)
      parent.arr.reverse()
      expect(spy.mostRecentCall.args[0]).toBe('arr')
      expect(spy.mostRecentCall.args[1]).toBe(parent.arr)
      expect(spy.mostRecentCall.args[2].method).toBe('reverse')

    })

    it('shadowed properties change on parent should not propagate down', function () {
      // when a shadowed property changed on parent scope,
      // the event should NOT be propagated down
      var spy = jasmine.createSpy('inheritance')
      child._observer.on('set', spy)
      parent.a = 'a changed'
      expect(spy.callCount).toBe(0)
    })

  })

  describe('inheritance with data sync on parent data', function () {
    
    var parent = new Vue({
      data: {
        arr: [{a:1},{a:2}]
      }
    })

    var child = new Vue({
      parent: parent,
      syncData: true,
      data: parent.arr[0]
    })

    it('should trigger proper events', function () {
      
      var parentSpy = jasmine.createSpy('parent')
      var childSpy = jasmine.createSpy('child')
      parent._observer.on('set', parentSpy)
      child._observer.on('set', childSpy)
      child.a = 3

      // make sure data sync is working
      expect(parent.arr[0].a).toBe(3)

      expect(parentSpy.callCount).toBe(1)
      expect(parentSpy).toHaveBeenCalledWith('arr.0.a', 3, u)

      expect(childSpy.callCount).toBe(2)
      expect(childSpy).toHaveBeenCalledWith('a', 3, u)
      expect(childSpy).toHaveBeenCalledWith('arr.0.a', 3, u)
    })

  })

  describe('computed', function () {
    
    var vm = new Vue({
      data: {
        a: 'a',
        b: 'b'
      },
      computed: {
        c: function () {
          expect(this).toBe(vm)
          return this.a + this.b
        },
        d: {
          get: function () {
            expect(this).toBe(vm)
            return this.a + this.b
          },
          set: function (newVal) {
            expect(this).toBe(vm)
            var vals = newVal.split(' ')
            this.a = vals[0]
            this.b = vals[1]
          }
        }
      }
    })

    it('get', function () {
      expect(vm.c).toBe('ab')
      expect(vm.d).toBe('ab')
    })

    it('set', function () {
      vm.c = 123 // should do nothing
      vm.d = 'c d'
      expect(vm.a).toBe('c')
      expect(vm.b).toBe('d')
      expect(vm.c).toBe('cd')
      expect(vm.d).toBe('cd')
    })

    it('inherit', function () {
      var child = new Vue({ parent: vm })
      expect(child.$scope.c).toBe('cd')

      child.$scope.d = 'e f'
      expect(vm.a).toBe('e')
      expect(vm.b).toBe('f')
      expect(vm.c).toBe('ef')
      expect(vm.d).toBe('ef')
      expect(child.$scope.a).toBe('e')
      expect(child.$scope.b).toBe('f')
      expect(child.$scope.c).toBe('ef')
      expect(child.$scope.d).toBe('ef')
    })

  })

})