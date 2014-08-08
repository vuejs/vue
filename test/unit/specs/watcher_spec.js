var Vue = require('../../../src/vue')
var then = Vue.nextTick
var Watcher = require('../../../src/watcher')

describe('Watcher', function () {

  var vm, spy

  beforeEach(function () {
    vm = new Vue({
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
    then(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.b = { c: 4 } // swapping the object
      then(function () {
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
    then(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.b = { c: 4 } // swapping the object
      then(function () {
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
    then(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.c = 'd' // changing the dynamic segment in path
      then(function () {
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
    then(function () {
      expect(watcher.value).toBe(4)
      expect(spy.callCount).toBe(1)
      expect(spy).toHaveBeenCalledWith(4, 3)
      // change two dependencies at once
      vm.a = 2
      vm.b.c = 4
      then(function () {
        expect(watcher.value).toBe(6)
        // should trigger only once callback,
        // because it was in the same event loop.
        expect(spy.callCount).toBe(2)
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
    then(function () {
      expect(watcher.value).toBe(2)
      expect(spy).toHaveBeenCalledWith(2, 4)
      vm.b.c = 3
      then(function () {
        expect(watcher.value).toBe(3)
        expect(spy).toHaveBeenCalledWith(3, 2)
        done()
      })
    })
  })

  it('non-existent path, $add later', function (done) {
    var watcher = new Watcher(vm, 'd.e', spy)
    expect(watcher.value).toBeUndefined()
    vm.$scope.$add('d', { e: 123 })
    then(function () {
      expect(watcher.value).toBe(123)
      expect(spy).toHaveBeenCalledWith(123, undefined)
      done()
    })
  })

  it('$delete', function (done) {
    var watcher = new Watcher(vm, 'b.c', spy)
    expect(watcher.value).toBe(2)
    vm.$scope.$delete('b')
    then(function () {
      expect(watcher.value).toBeUndefined()
      expect(spy).toHaveBeenCalledWith(undefined, 2)
      done()
    })
  })

  it('swapping $data', function (done) {
    var watcher = new Watcher(vm, 'b.c', spy)
    expect(watcher.value).toBe(2)
    vm.$data = { b: { c: 3}}
    then(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      done()
    })
  })

  it('path containing $data', function (done) {
    var watcher = new Watcher(vm, '$data.b.c', spy)
    expect(watcher.value).toBe(2)
    vm.b = { c: 3 }
    then(function () {
      expect(watcher.value).toBe(3)
      expect(spy).toHaveBeenCalledWith(3, 2)
      vm.$data = { b: {c: 4}}
      then(function () {
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
    then(function () {
      expect(spy).toHaveBeenCalledWith(oldData, oldData)
      var newData = {}
      vm.$data = newData
      then(function() {
        expect(spy).toHaveBeenCalledWith(newData, oldData)
        expect(watcher.value).toBe(newData)
        done()
      })
    })
  })

  it('callback context', function (done) {
    var context = {}
    var watcher = new Watcher(vm, 'b.c', function () {
      spy.apply(this, arguments)
      expect(this).toBe(context)
    }, context)
    vm.b.c = 3
    then(function () {
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
    then(function () {
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
    then(function () {
      expect(vm.b.c).toBe(2)
      expect(watcher.value).toBe(2)
      expect(spy.callCount).toBe(0)
      watcher.set(6)
      then(function () {
        expect(vm.b.c).toBe(6)
        expect(watcher.value).toBe(6)
        expect(spy).toHaveBeenCalledWith(6, 2)
        done()
      })
    })
  })

})