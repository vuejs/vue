/**
 * Test property proxy, scope inheritance,
 * data event propagation and data sync
 */

var Vue = require('../../../../src/vue')
var Observer = require('../../../../src/observe/observer')
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

    it('should proxy data properties', function () {
      expect(vm.a).toBe(vm.$data.a)
      expect(vm.b).toBe(vm.$data.b)
    })

    it('should trigger set events', function () {
      var spy = jasmine.createSpy('basic')
      vm.$observer.on('set', spy)
      // simple
      vm.a = 2
      expect(spy.calls.count()).toBe(1)
      expect(spy).toHaveBeenCalledWith('a', 2, undefined, undefined)
      // nested path
      vm.b.c = 3
      expect(spy.calls.count()).toBe(2)
      expect(spy).toHaveBeenCalledWith('b.c', 3, undefined, undefined)
    })

    it('should trigger add/delete events', function () {
      var spy = jasmine.createSpy('instantiation')
      vm.$observer
        .on('add', spy)
        .on('delete', spy)
      // add
      vm.$add('c', 123)
      expect(spy.calls.count()).toBe(1)
      expect(spy).toHaveBeenCalledWith('c', 123, undefined, undefined)
      // delete
      vm.$delete('c')
      expect(spy.calls.count()).toBe(2)
      expect(spy).toHaveBeenCalledWith('c', undefined, undefined, undefined)
      // meta
      vm._defineMeta('$index', 1)
      expect(spy.calls.count()).toBe(3)
      expect(spy).toHaveBeenCalledWith('$index', 1, undefined, undefined)
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
      expect(vm.b).toBe(data.b)
    })

    it('should sync add', function () {
      // vm -> data
      vm.$add('c', 123)
      expect(data.c).toBe(123)
      // data -> vm
      data.$add('d', 456)
      expect(vm.d).toBe(456)
    })

    it('should sync delete', function () {
      // vm -> data
      vm.$delete('d')
      expect(data.hasOwnProperty('d')).toBe(false)
      // data -> vm
      data.$delete('c')
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

    var child = parent.$addChild({
      data: {
        a: 'child a'
      }
    })

    it('child should inherit parent data on scope', function () {
      expect(child.b).toBe(parent.b) // object
      expect(child.c).toBe(parent.c) // primitive value
    })

    it('child should shadow parent property with same key', function () {
      expect(parent.a).toBe('parent a')
      expect(child.a).toBe('child a')
    })

    it('setting scope properties on child should affect parent', function () {
      child.c = 'modified by child'
      expect(parent.c).toBe('modified by child')
    })

    it('parent event should propagate when child has same binding', function () {
      // object path
      var b = child._createBindingAt('b.c')
      b._notify = jasmine.createSpy('binding')
      parent.b.c = 3
      expect(b._notify).toHaveBeenCalled()
      // array path
      var b = child._createBindingAt('arr.0.a')
      b._notify = jasmine.createSpy('binding')
      parent.arr[0].a = 2
      expect(b._notify).toHaveBeenCalled()
      // add
      var b = child._createBindingAt('e')
      b._notify = jasmine.createSpy('binding')
      parent.$add('e', 123)
      expect(b._notify).toHaveBeenCalled()
      // delete
      parent.$delete('e')
      expect(b._notify.calls.count()).toBe(2)
    })

    it('parent event should not propagate when child has shadowing key', function () {
      var b = child._createBindingAt('c')
      b._notify = jasmine.createSpy('binding')
      child.$add('c', 123)
      expect(b._notify.calls.count()).toBe(1)
      parent.c = 456
      expect(b._notify.calls.count()).toBe(1)
    })

    it('parent event should not even traverse if child doesn\'t have changed binding', function () {
      parent._notifyChildren = jasmine.createSpy()
      parent.c = 123
      expect(parent._notifyChildren.calls.count()).toBe(1)
      // should not be called after binding teardown
      child._teardownBindingAt('c')
      parent.c = 234
      expect(parent._notifyChildren.calls.count()).toBe(1)
    })

  })

  describe('inheritance with data sync on parent data', function () {
    
    var parent = new Vue({
      data: {
        arr: [{a:1},{a:2}]
      }
    })

    var child = parent.$addChild({
      data: parent.arr[0]
    })

    it('should trigger proper events', function () {
      var parentSpy = parent._createBindingAt('arr.0.a')
      parentSpy._notify = jasmine.createSpy('binding')
      var childSpy = child._createBindingAt('arr.0.a')
      childSpy._notify = jasmine.createSpy('binding')
      var childSpy2 = child._createBindingAt('a')
      childSpy2._notify = jasmine.createSpy('binding')
      child.a = 3

      // make sure data sync is working
      expect(parent.arr[0].a).toBe(3)

      expect(parentSpy._notify).toHaveBeenCalled()
      expect(childSpy._notify).toHaveBeenCalled()
      expect(childSpy2._notify).toHaveBeenCalled()
    })

  })

  describe('swapping $data', function () {
    
    var oldData = { a: 1, c: 4 }
    var newData = { a: 2, b: 3 }
    var vm = new Vue({
      data: oldData
    })
    var vmSpy = jasmine.createSpy('vm')
    var vmAddSpy = jasmine.createSpy('vmAdd')
    var oldDataSpy = jasmine.createSpy('oldData')
    vm.$observer.on('set', vmSpy)
    vm.$observer.on('add', vmAddSpy)
    oldData.__ob__.on('set', oldDataSpy)

    vm.$data = newData

    it('should sync new data', function () {
      expect(vm._data).toBe(newData)
      expect(vm.a).toBe(2)
      expect(vm.b).toBe(3)
      expect(vmSpy).toHaveBeenCalledWith('a', 2, undefined, undefined)
      expect(vmAddSpy).toHaveBeenCalledWith('b', 3, undefined, undefined)
    })

    it('should unsync old data', function () {
      expect(vm.hasOwnProperty('c')).toBe(false)
      vm.a = 3
      expect(oldDataSpy.calls.count()).toBe(0)
      expect(oldData.a).toBe(1)
      expect(newData.a).toBe(3)
    })

  })

  describe('scope teardown', function () {
    var parent = new Vue({
      data: {
        a: 123
      }
    })
    var child = new Vue({
      parent: parent
    })
    var spy = jasmine.createSpy('teardown')
    child.$observer.on('set', spy)

    it('should stop relaying parent events', function () {
      child._teardownScope()
      parent.a = 234
      expect(spy.calls.count()).toBe(0)
      expect(child._data).toBeNull()
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
      var child = vm.$addChild()
      expect(child.c).toBe('cd')

      child.d = 'e f'
      expect(vm.a).toBe('e')
      expect(vm.b).toBe('f')
      expect(vm.c).toBe('ef')
      expect(vm.d).toBe('ef')
      expect(child.a).toBe('e')
      expect(child.b).toBe('f')
      expect(child.c).toBe('ef')
      expect(child.d).toBe('ef')
    })

  })

  describe('methods', function () {

    it('should work and have correct context', function () {
      var vm = new Vue({
        data: {
          a: 1
        },
        methods: {
          test: function () {
            expect(this instanceof Vue).toBe(true)
            return this.a
          }
        }
      })
      expect(vm.test()).toBe(1)

      var child = vm.$addChild()
      expect(child.test()).toBe(1)
    })

  })

})