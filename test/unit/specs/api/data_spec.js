var Vue = require('src')
var _ = require('src/util')
var nextTick = _.nextTick

describe('Data API', function () {
  var vm
  beforeEach(function () {
    var el = document.createElement('div')
    el.setAttribute('prop', 'foo')
    vm = new Vue({
      el: el,
      props: ['prop'],
      data: {
        a: 1,
        b: {
          c: 2
        }
      },
      filters: {
        double: function (v) {
          return v * 2
        }
      },
      computed: {
        d: function () {
          return this.a + 1
        }
      }
    })
  })

  it('$get', function () {
    expect(vm.$get('a')).toBe(1)
    expect(vm.$get('b["c"]')).toBe(2)
    expect(vm.$get('a + b.c')).toBe(3)
    expect(vm.$get('c')).toBeUndefined()
    // invalid, should warn
    vm.$get('a(')
    expect('Invalid expression').toHaveBeenWarned()
  })

  it('$set', function () {
    vm.$set('a', 2)
    expect(vm.a).toBe(2)
    vm.$set('b["c"]', 3)
    expect(vm.b.c).toBe(3)
    // setting unexisting
    vm.$set('c.d', 2)
    expect(vm.c.d).toBe(2)
    // warn against setting unexisting
    expect('Consider pre-initializing').toHaveBeenWarned()
  })

  it('$set invalid', function () {
    vm.$set('c + d', 1)
    expect('Invalid setter expression').toHaveBeenWarned()
  })

  it('$delete', function () {
    vm._digest = jasmine.createSpy()
    vm.$delete('a')
    expect(_.hasOwn(vm, 'a')).toBe(false)
    expect(_.hasOwn(vm._data, 'a')).toBe(false)
    expect(vm._digest).toHaveBeenCalled()
    // reserved key should not be deleted
    vm.$delete('_data')
    expect(vm._data).toBeTruthy()
  })

  it('$watch', function (done) {
    var spy = jasmine.createSpy()
    // test immediate invoke
    var unwatch = vm.$watch('a + b.c', spy, {
      immediate: true
    })
    expect(spy).toHaveBeenCalledWith(3)
    vm.a = 2
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(4, 3)
      // unwatch
      unwatch()
      vm.a = 3
      nextTick(function () {
        expect(spy.calls.count()).toBe(2)
        done()
      })
    })
  })

  it('function $watch', function (done) {
    var spy = jasmine.createSpy()
    // test immediate invoke
    var unwatch = vm.$watch(function () {
      return this.a + this.b.c
    }, spy, { immediate: true })
    expect(spy).toHaveBeenCalledWith(3)
    vm.a = 2
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(4, 3)
      // unwatch
      unwatch()
      vm.a = 3
      nextTick(function () {
        expect(spy.calls.count()).toBe(2)
        done()
      })
    })
  })

  it('deep $watch', function (done) {
    var oldB = vm.b
    var spy = jasmine.createSpy()
    vm.$watch('b', spy, {
      deep: true
    })
    vm.b.c = 3
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(oldB, oldB)
      vm.b = { c: 4 }
      nextTick(function () {
        expect(spy).toHaveBeenCalledWith(vm.b, oldB)
        done()
      })
    })
  })

  it('$watch with filters', function (done) {
    var spy = jasmine.createSpy()
    vm.$watch('a | double', spy)
    vm.a = 2
    nextTick(function () {
      expect(spy).toHaveBeenCalledWith(4, 2)
      done()
    })
  })

  it('$eval', function () {
    expect(vm.$eval('a')).toBe(1)
    expect(vm.$eval('b.c')).toBe(2)
    expect(vm.$eval('a + b.c | double')).toBe(6)
  })

  it('$interpolate', function () {
    expect(vm.$interpolate('abc')).toBe('abc')
    expect(vm.$interpolate('{{a}}')).toBe('1')
    expect(vm.$interpolate('{{a}} and {{a + b.c | double}}')).toBe('1 and 6')
  })

  if (typeof console !== 'undefined') {
    it('$log', function () {
      var oldLog = console.log
      var spy = jasmine.createSpy()
      console.log = function (val) {
        expect(val.a).toBe(1)
        expect(val.b.c).toBe(2)
        expect(val.d).toBe(2)
        expect(val.prop).toBe('foo')
        spy()
      }
      vm.$log()
      expect(spy.calls.count()).toBe(1)
      console.log = function (val) {
        expect(val.c).toBe(2)
        spy()
      }
      vm.$log('b')
      expect(spy.calls.count()).toBe(2)
      console.log = oldLog
    })
  }
})
