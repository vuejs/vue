var Vue = require('src')
var nextTick = Vue.nextTick
var Watcher = require('src/watcher')
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
        c: 'c',
        msg: 'yo'
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

  it('meta properties', function (done) {
    _.defineReactive(vm, '$index', 1)
    var watcher = new Watcher(vm, '$index + 1', spy)
    expect(watcher.value).toBe(2)
    vm.$index = 2
    nextTick(function () {
      expect(watcher.value).toBe(3)
      done()
    })
  })

  it('non-existent path, set later', function (done) {
    var watcher = new Watcher(vm, 'd.e', spy)
    var watcher2 = new Watcher(vm, 'b.e', spy)
    expect(watcher.value).toBeUndefined()
    expect(watcher2.value).toBeUndefined()
    // check $add should not affect isolated children
    var child2 = new Vue({ parent: vm })
    var watcher3 = new Watcher(child2, 'd.e', spy)
    expect(watcher3.value).toBeUndefined()
    vm.$set('d', { e: 123 })
    _.set(vm.b, 'e', 234)
    nextTick(function () {
      expect(watcher.value).toBe(123)
      expect(watcher2.value).toBe(234)
      expect(watcher3.value).toBeUndefined()
      expect(spy.calls.count()).toBe(2)
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
    vm.$data = { b: { c: 3 }, e: 4 }
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
      vm.$data = { b: { c: 4 }}
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
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(newData, oldData)
      expect(watcher.value).toBe(newData)
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
    var watcher = new Watcher(vm, 'b.c', spy, {
      filters: [
        { name: 'test', args: [{ value: 3, dynamic: false }] },
        { name: 'test2', args: [{ value: 'msg', dynamic: true }] }
      ]
    })
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
    var watcher = new Watcher(vm, 'b["c"]', spy, {
      filters: [
        { name: 'test', args: [{value: 5, dynamic: false}] }
      ],
      twoWay: true
    })
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
    var watcher = new Watcher(vm, 'd.e.f', spy, {
      twoWay: true
    })
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
    new Watcher(vm, 'b', spy, {
      deep: true
    })
    vm.b.c = { d: 4 }
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
      var oldB = vm.b
      vm.b = { c: [{ a: 1 }]}
      nextTick(function () {
        expect(spy).toHaveBeenCalledWith(vm.b, oldB)
        expect(spy.calls.count()).toBe(2)
        vm.b.c[0].a = 2
        nextTick(function () {
          expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
          expect(spy.calls.count()).toBe(3)
          done()
        })
      })
    })
  })

  it('deep watch with circular references', function (done) {
    new Watcher(vm, 'b', spy, {
      deep: true
    })
    Vue.set(vm.b, '_', vm.b)
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
      expect(spy.calls.count()).toBe(1)
      vm.b._.c = 1
      nextTick(function () {
        expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
        expect(spy.calls.count()).toBe(2)
        done()
      })
    })
  })

  it('fire change for prop addition/deletion in non-deep mode', function (done) {
    new Watcher(vm, 'b', spy)
    Vue.set(vm.b, 'e', 123)
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(vm.b, vm.b)
      expect(spy.calls.count()).toBe(1)
      Vue.delete(vm.b, 'e')
      nextTick(function () {
        expect(spy.calls.count()).toBe(2)
        done()
      })
    })
  })

  it('watch function', function (done) {
    var watcher = new Watcher(vm, function () {
      return this.a + this.b.d
    }, spy)
    expect(watcher.value).toBe(5)
    vm.a = 2
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(6, 5)
      vm.b = { d: 2 }
      nextTick(function () {
        expect(spy).toHaveBeenCalledWith(4, 6)
        done()
      })
    })
  })

  it('lazy mode', function (done) {
    var watcher = new Watcher(vm, function () {
      return this.a + this.b.d
    }, null, { lazy: true })
    expect(watcher.lazy).toBe(true)
    expect(watcher.value).toBeUndefined()
    expect(watcher.dirty).toBe(true)
    watcher.evaluate()
    expect(watcher.value).toBe(5)
    expect(watcher.dirty).toBe(false)
    vm.a = 2
    nextTick(function () {
      expect(watcher.value).toBe(5)
      expect(watcher.dirty).toBe(true)
      watcher.evaluate()
      expect(watcher.value).toBe(6)
      expect(watcher.dirty).toBe(false)
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
      expect(watcher.cb).toBe(null)
      expect(spy).not.toHaveBeenCalled()
      done()
    })
  })

  it('synchronous updates', function () {
    config.async = false
    new Watcher(vm, 'a', spy)
    vm.a = 2
    vm.a = 3
    expect(spy.calls.count()).toBe(2)
    expect(spy).toHaveBeenCalledWith(2, 1)
    expect(spy).toHaveBeenCalledWith(3, 2)
    config.async = true
  })

  it('warn getter errors', function () {
    new Watcher(vm, 'd.e + c', spy)
    expect('Error when evaluating expression').toHaveBeenWarned()
  })

  it('warn setter errors', function () {
    var watcher = new Watcher(vm, 'a + b', spy)
    watcher.set(123)
    expect('Error when evaluating setter').toHaveBeenWarned()
  })
})
