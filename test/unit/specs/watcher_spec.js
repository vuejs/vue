var Vue = require('../../../src/vue')
var nextTick = Vue.nextTick
var Watcher = require('../../../src/watcher')

describe('Watcher', function () {

  var vm, spy

  beforeEach(function () {
    vm = new Vue({
      filters: {},
      data: {
        a: 1,
        b: {
          c: 2,
          d: 4
        },
        c: 'c'
      }
    })
    spy = jasmine.createSpy('watcher')
  })
  
  it('simple path', function (done) {
    var watcher = new Watcher(vm, 'b.c', spy)
    expect(watcher.value).toBe(2)
    vm.b.c = 3
    nextTick(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.b = { c: 4 } // swapping the object
      nextTick(function () {
        expect(watcher.value).toBe(4)
        expect(spy).toHaveBeenCalledWith(4, 3)
        done()
      })
    })
  })

  it('bracket access path', function (done) {
    var watcher = new Watcher(vm, 'b["c"]', spy)
    expect(watcher.value).toBe(2)
    vm.b.c = 3
    nextTick(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.b = { c: 4 } // swapping the object
      nextTick(function () {
        expect(watcher.value).toBe(4)
        expect(spy).toHaveBeenCalledWith(4, 3)
        done()
      })
    })
  })

  it('dynamic path', function (done) {
    var watcher = new Watcher(vm, 'b[c]', spy)
    expect(watcher.value).toBe(2)
    vm.b.c = 3
    nextTick(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.c = 'd' // changing the dynamic segment in path
      nextTick(function () {
        expect(watcher.value).toBe(4)
        expect(spy).toHaveBeenCalledWith(4, 3)
        done()
      })
    })
  })

  it('simple expression', function (done) {
    var watcher = new Watcher(vm, 'a + b.c', spy)
    expect(watcher.value).toBe(3)
    vm.b.c = 3
    nextTick(function () {
      expect(watcher.value).toBe(4)
      expect(spy.calls.count()).toBe(1)
      expect(spy).toHaveBeenCalledWith(4, 3)
      // change two dependencies at once
      vm.a = 2
      vm.b.c = 4
      nextTick(function () {
        expect(watcher.value).toBe(6)
        // should trigger only once callback,
        // because it was in the same event loop.
        expect(spy.calls.count()).toBe(2)
        expect(spy).toHaveBeenCalledWith(6, 4)
        done()
      })
    })
  })

  it('ternary expression', function (done) {
    // we're actually testing for the dependency re-calculation here
    var watcher = new Watcher(vm, 'a > 1 ? b.c : b.d', spy)
    expect(watcher.value).toBe(4)
    vm.a = 2
    nextTick(function () {
      expect(watcher.value).toBe(2)
      expect(spy).toHaveBeenCalledWith(2, 4)
      vm.b.c = 3
      nextTick(function () {
        expect(watcher.value).toBe(3)
        expect(spy).toHaveBeenCalledWith(3, 2)
        done()
      })
    })
  })

  it('non-existent path, $add later', function (done) {
    var watcher = new Watcher(vm, 'd.e', spy)
    var watcher2 = new Watcher(vm, 'b.e', spy)
    expect(watcher.value).toBeUndefined()
    expect(watcher2.value).toBeUndefined()
    vm.$add('d', { e: 123 })
    vm.b.$add('e', 234)
    nextTick(function () {
      expect(watcher.value).toBe(123)
      expect(watcher2.value).toBe(234)
      expect(spy).toHaveBeenCalledWith(123, undefined)
      expect(spy).toHaveBeenCalledWith(234, undefined)
      done()
    })
  })

  it('$delete', function (done) {
    var watcher = new Watcher(vm, 'b.c', spy)
    expect(watcher.value).toBe(2)
    vm.$delete('b')
    nextTick(function () {
      expect(watcher.value).toBeUndefined()
      expect(spy).toHaveBeenCalledWith(undefined, 2)
      done()
    })
  })

  it('swapping $data', function (done) {
    var watcher = new Watcher(vm, 'b.c', spy)
    expect(watcher.value).toBe(2)
    vm.$data = { b: { c: 3}}
    nextTick(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      done()
    })
  })

  it('path containing $data', function (done) {
    var watcher = new Watcher(vm, '$data.b.c', spy)
    expect(watcher.value).toBe(2)
    vm.b = { c: 3 }
    nextTick(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.$data = { b: {c: 4}}
      nextTick(function () {
        expect(watcher.value).toBe(4)
        expect(spy).toHaveBeenCalledWith(4, 3)
        done()
      })
    })
  })

  it('watching $data', function (done) {
    var oldData = vm.$data
    var watcher = new Watcher(vm, '$data', spy)
    expect(watcher.value).toBe(oldData)
    vm.a = 2
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(oldData, oldData)
      var newData = {}
      vm.$data = newData
      nextTick(function() {
        expect(spy).toHaveBeenCalledWith(newData, oldData)
        expect(watcher.value).toBe(newData)
        done()
      })
    })
  })

  it('watching parent scope properties', function (done) {
    var child = vm._addChild()
    var spy2 = jasmine.createSpy('watch')
    var watcher1 = new Watcher(child, '$data', spy)
    var watcher2 = new Watcher(child, 'a', spy2)
    vm.a = 123
    nextTick(function () {
      // $data should only be called on self data change
      expect(watcher1.value).toBe(child.$data)
      expect(spy.calls.count()).toBe(0)
      expect(watcher2.value).toBe(123)
      expect(spy2).toHaveBeenCalledWith(123, 1)
      done()
    })
  })

  it('callback context', function (done) {
    var context = {}
    var watcher = new Watcher(vm, 'b.c', function () {
      spy.apply(this, arguments)
      expect(this).toBe(context)
    }, context)
    vm.b.c = 3
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(3, 2)
      done()
    })
  })

  it('filters', function (done) {
    vm.$options.filters.test = function (val, multi) {
      return val * multi
    }
    vm.$options.filters.test2 = function (val, str) {
      return val + str
    }
    var watcher = new Watcher(vm, 'b.c', spy, null, [
      { name: 'test', args: [3] },
      { name: 'test2', args: ['yo']}
    ])
    expect(watcher.value).toBe('6yo')
    vm.b.c = 3
    nextTick(function () {
      expect(watcher.value).toBe('9yo')
      expect(spy).toHaveBeenCalledWith('9yo', '6yo')
      done()
    })
  })

  it('setter', function (done) {
    vm.$options.filters.test = {
      write: function (val, oldVal, arg) {
        return val > arg ? val : oldVal
      }
    }
    var watcher = new Watcher(vm, 'b["c"]', spy, null, [
      { name: 'test', args: [5] }
    ], true)
    expect(watcher.value).toBe(2)
    watcher.set(4) // shoud not change the value
    nextTick(function () {
      expect(vm.b.c).toBe(2)
      expect(watcher.value).toBe(2)
      expect(spy.calls.count()).toBe(0)
      watcher.set(6)
      nextTick(function () {
        expect(vm.b.c).toBe(6)
        expect(watcher.value).toBe(6)
        expect(spy).toHaveBeenCalledWith(6, 2)
        done()
      })
    })
  })

  it('set non-existent values', function (done) {
    var watcher = new Watcher(vm, 'd.e.f', spy)
    expect(watcher.value).toBeUndefined()
    watcher.set(123)
    nextTick(function () {
      expect(vm.d.e.f).toBe(123)
      expect(watcher.value).toBe(123)
      expect(spy).toHaveBeenCalledWith(123, undefined)
      done()
    })
  })

  it('teardown', function (done) {
    var watcher = new Watcher(vm, 'b.c', spy)
    watcher.teardown()
    vm.b.c = 3
    nextTick(function () {
      expect(watcher.active).toBe(false)
      expect(spy.calls.count()).toBe(0)
      done()
    })
  })

})