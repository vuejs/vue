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
      expect(vm.$scope.a).toEqual(vm.$data.a)
      expect(vm.$scope.b).toEqual(vm.$data.b)
    })

    it('should proxy these properties', function () {
      expect(vm.a).toEqual(vm.$scope.a)
      expect(vm.b).toEqual(vm.$scope.b)
    })

    it('should trigger set events', function () {
      var spy = jasmine.createSpy('basic')
      vm._observer.on('set', spy)

      // set on scope
      vm.$scope.a = 2
      expect(spy.callCount).toEqual(1)
      expect(spy).toHaveBeenCalledWith('a', 2, u)

      // set on vm
      vm.b.c = 3
      expect(spy.callCount).toEqual(2)
      expect(spy).toHaveBeenCalledWith('b.c', 3, u)
    })

    it('should trigger add/delete events', function () {
      var spy = jasmine.createSpy('instantiation')
      vm._observer
        .on('add', spy)
        .on('delete', spy)

      // add on scope
      vm.$scope.$add('c', 123)
      expect(spy.callCount).toEqual(1)
      expect(spy).toHaveBeenCalledWith('c', 123, u)

      // delete on scope
      vm.$scope.$delete('c')
      expect(spy.callCount).toEqual(2)
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
      expect(vm.$data).toEqual(data)
    })

    it('should sync set', function () {
      // vm -> data
      vm.a = 2
      expect(data.a).toEqual(2)
      // data -> vm
      data.b = {d:3}
      expect(vm.$scope.b).toEqual(data.b)
      expect(vm.b).toEqual(data.b)
    })

    it('should sync add', function () {
      // vm -> data
      vm.$scope.$add('c', 123)
      expect(data.c).toEqual(123)
      // data -> vm
      data.$add('d', 456)
      expect(vm.$scope.d).toEqual(456)
      expect(vm.d).toEqual(456)
    })

    it('should sync delete', function () {
      // vm -> data
      vm.$scope.$delete('d')
      expect(data.hasOwnProperty('d')).toBeFalsy()
      // data -> vm
      data.$delete('c')
      expect(vm.$scope.hasOwnProperty('c')).toBeFalsy()
      expect(vm.hasOwnProperty('c')).toBeFalsy()
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
      expect(child.$scope.b).toEqual(parent.b) // object
      expect(child.$scope.c).toEqual(parent.c) // primitive value
    })

    it('child should not ineherit data on instance', function () {
      expect(child.b).toBeUndefined()
      expect(child.c).toBeUndefined()
    })

    it('child should shadow parent property with same key', function () {
      expect(parent.a).toEqual('parent a')
      expect(child.$scope.a).toEqual('child a')
      expect(child.a).toEqual('child a')
    })

    it('setting scope properties on child should affect parent', function () {
      child.$scope.c = 'modified by child'
      expect(parent.c).toEqual('modified by child')
    })

    it('events on parent should propagate down to child', function () {
      // when a shadowed property changed on parent scope,
      // the event should NOT be propagated down
      var spy = jasmine.createSpy('inheritance')
      child._observer.on('set', spy)
      parent.c = 'c changed'
      expect(spy.callCount).toEqual(1)
      expect(spy).toHaveBeenCalledWith('c', 'c changed', u)

      spy = jasmine.createSpy('inheritance')
      child._observer.on('add', spy)
      parent.$scope.$add('e', 123)
      expect(spy.callCount).toEqual(1)
      expect(spy).toHaveBeenCalledWith('e', 123, u)

      spy = jasmine.createSpy('inheritance')
      child._observer.on('delete', spy)
      parent.$scope.$delete('e')
      expect(spy.callCount).toEqual(1)
      expect(spy).toHaveBeenCalledWith('e', u, u)

      spy = jasmine.createSpy('inheritance')
      child._observer.on('mutate', spy)
      parent.arr.reverse()
      expect(spy.mostRecentCall.args[0]).toEqual('arr')
      expect(spy.mostRecentCall.args[1]).toEqual(parent.arr)
      expect(spy.mostRecentCall.args[2].method).toEqual('reverse')

    })

    it('shadowed properties change on parent should not propagate down', function () {
      // when a shadowed property changed on parent scope,
      // the event should NOT be propagated down
      var spy = jasmine.createSpy('inheritance')
      child._observer.on('set', spy)
      parent.a = 'a changed'
      expect(spy.callCount).toEqual(0)
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
      expect(parent.arr[0].a).toEqual(3)

      expect(parentSpy.callCount).toEqual(1)
      expect(parentSpy).toHaveBeenCalledWith('arr.0.a', 3, u)

      expect(childSpy.callCount).toEqual(2)
      expect(childSpy).toHaveBeenCalledWith('a', 3, u)
      expect(childSpy).toHaveBeenCalledWith('arr.0.a', 3, u)
    })

  })

})