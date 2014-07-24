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
      var spy = jasmine.createSpy('instantiation')
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
    // body...
  })

  describe('inheritance with data sync', function () {
    // body...
  })

})