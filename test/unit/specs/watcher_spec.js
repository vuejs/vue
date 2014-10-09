var Vue = require('../../../src/vue')
var nextTick = Vue.nextTick
var Watcher = require('../../../src/watcher')
var _ = Vue.util
var config = Vue.config

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
    spyOn(_, 'warn')
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

  it('meta properties', function (done) {
    vm._defineMeta('$index', 1)
    var watcher = new Watcher(vm, '$index + 1', spy)
    expect(watcher.value).toBe(2)
    vm.$index = 2
    nextTick(function () {
      expect(watcher.value).toBe(3)
      done()
    })
  })

  it('non-existent path, $add later', function (done) {
    var watcher = new Watcher(vm, 'd.e', spy)
    var watcher2 = new Watcher(vm, 'b.e', spy)
    expect(watcher.value).toBeUndefined()
    expect(watcher2.value).toBeUndefined()
    // check $add affecting children
    var child = vm.$addChild({
      inherit: true
    })
    var watcher3 = new Watcher(child, 'd.e', spy)
    var watcher4 = new Watcher(child, 'b.e', spy)
    // check $add should not affect isolated children
    var child2 = vm.$addChild()
    var watcher5 = new Watcher(child2, 'd.e', spy)
    expect(watcher5.value).toBeUndefined()
    vm.$add('d', { e: 123 })
    vm.b.$add('e', 234)
    nextTick(function () {
      expect(watcher.value).toBe(123)
      expect(watcher2.value).toBe(234)
      expect(watcher3.value).toBe(123)
      expect(watcher4.value).toBe(234)
      expect(watcher5.value).toBeUndefined()
      expect(spy.calls.count()).toBe(4)
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
    // existing path
    var watcher = new Watcher(vm, 'b.c', spy)
    var spy2 = jasmine.createSpy()
    // non-existing path
    var watcher2 = new Watcher(vm, 'e', spy2)
    expect(watcher.value).toBe(2)
    expect(watcher2.value).toBeUndefined()
    vm.$data = { b: { c: 3}, e: 4 }
    nextTick(function () {
      expect(watcher.value).toBe(3)
      expect(watcher2.value).toBe(4)
      expect(spy).toHaveBeenCalledWith(3, 2)
      expect(spy2).toHaveBeenCalledWith(4, undefined)
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
    var newData = {}
    vm.$data = newData
    nextTick(function() {
      expect(spy).toHaveBeenCalledWith(newData, oldData)
      expect(watcher.value).toBe(newData)
      done()
    })
  })

  it('watching parent scope properties', function (done) {
    var child = vm.$addChild({
      inherit: true
    })
    var spy2 = jasmine.createSpy('watch')
    var watcher1 = new Watcher(child, '$data', spy)
    var watcher2 = new Watcher(child, 'a', spy2)
    vm.a = 123
    nextTick(function () {
      // $data should only be called on self data change
      expect(watcher1.value).toBe(child.$data)
      expect(spy).not.toHaveBeenCalled()
      expect(watcher2.value).toBe(123)
      expect(spy2).toHaveBeenCalledWith(123, 1)
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
    var filters = _.resolveFilters(vm, [
      { name: 'test', args: [3] },
      { name: 'test2', args: ['yo']}
    ])
    var watcher = new Watcher(vm, 'b.c', spy, filters)
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
    var filters = _.resolveFilters(vm, [
      { name: 'test', args: [5] }
    ])
    var watcher = new Watcher(vm, 'b["c"]', spy, filters, true)
    expect(watcher.value).toBe(2)
    watcher.set(4) // shoud not change the value
    nextTick(function () {
      expect(vm.b.c).toBe(2)
      expect(watcher.value).toBe(2)
      expect(spy).not.toHaveBeenCalled()
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

  it('deep watch', function (done) {
    var watcher = new Watcher(vm, 'b', spy, null, false, true)
    vm.b.c = 3
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
      var oldB = vm.b
      vm.b = { c: 4 }
      nextTick(function () {
        expect(spy).toHaveBeenCalledWith(vm.b, oldB)
        expect(spy.calls.count()).toBe(2)
        done()
      })
    })
  })

  it('add callback', function (done) {
    var watcher = new Watcher(vm, 'a', spy)
    var spy2 = jasmine.createSpy()
    watcher.addCb(spy2)
    vm.a = 99
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(99, 1)
      expect(spy2).toHaveBeenCalledWith(99, 1)
      done()
    })
  })

  it('remove callback', function (done) {
    // single, should equal teardown
    var fn = function () {}
    var watcher = new Watcher(vm, 'a', fn)
    watcher.removeCb(fn)
    expect(watcher.active).toBe(false)
    expect(watcher.vm).toBe(null)
    expect(watcher.cbs).toBe(null)
    // multiple
    watcher = new Watcher(vm, 'a', spy)
    var spy2 = jasmine.createSpy()
    watcher.addCb(spy2)
    watcher.removeCb(spy)
    vm.a = 234
    nextTick(function () {
      expect(spy).not.toHaveBeenCalled()
      expect(spy2).toHaveBeenCalledWith(234, 1)
      done()
    })
  })

  it('teardown', function (done) {
    var watcher = new Watcher(vm, 'b.c', spy)
    watcher.teardown()
    vm.b.c = 3
    nextTick(function () {
      expect(watcher.active).toBe(false)
      expect(watcher.vm).toBe(null)
      expect(watcher.cbs).toBe(null)
      expect(spy).not.toHaveBeenCalled()
      done()
    })
  })

})