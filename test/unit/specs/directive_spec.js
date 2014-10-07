var Vue = require('../../../src/vue')
var Directive = require('../../../src/directive')
var nextTick = Vue.nextTick

describe('Directive', function () {

  var el = {} // simply a mock to be able to run in Node
  var vm, def

  beforeEach(function () {
    def = {
      bind: jasmine.createSpy('bind'),
      update: jasmine.createSpy('update'),
      unbind: jasmine.createSpy('unbind')
    }
    vm = new Vue({
      data:{
        a:1
      },
      filters: {
        test: function (v) {
          return v * 2
        }
      },
      directives: {
        test: def
      }
    })
  })

  it('normal', function (done) {
    var d = new Directive('test', el, vm, {
      expression: 'a',
      arg: 'someArg',
      filters: [{name:'test'}]
    }, def)
    // properties
    expect(d.el).toBe(el)
    expect(d.name).toBe('test')
    expect(d.vm).toBe(vm)
    expect(d.arg).toBe('someArg')
    expect(d.expression).toBe('a')
    // init calls
    expect(def.bind).toHaveBeenCalled()
    expect(def.update).toHaveBeenCalledWith(2)
    expect(d._bound).toBe(true)
    // update
    vm.a = 2
    nextTick(function () {
      expect(def.update).toHaveBeenCalledWith(4, 2)
      // teardown
      d._teardown()
      expect(def.unbind).toHaveBeenCalled()
      expect(d._bound).toBe(false)
      expect(d._watcher).toBe(null)
      done()
    })
  })

  it('static literal', function () {
    def.isLiteral = true
    var d = new Directive('test', el, vm, {
      expression: 'a'
    }, def)
    expect(d._watcher).toBeUndefined()
    expect(d.expression).toBe('a')
    expect(d.bind).toHaveBeenCalled()
    expect(d.update).not.toHaveBeenCalled()
  })

  it('static literal, interpolate with no update', function () {
    def.isLiteral = true
    delete def.update
    var d = new Directive('test', el, vm, {
      expression: '{{a}}'
    }, def)
    expect(d._watcher).toBeUndefined()
    expect(d.expression).toBe(1)
    expect(d.bind).toHaveBeenCalled()
  })

  it('dynamic literal', function (done) {
    vm.a = '' // #468 dynamic literals with falsy initial
              // should still create the watcher.
    def.isLiteral = true
    var d = new Directive('test', el, vm, {
      expression: '{{a}}'
    }, def)
    expect(d._watcher).toBeDefined()
    expect(d.expression).toBe('')
    expect(def.bind).toHaveBeenCalled()
    expect(def.update).toHaveBeenCalledWith('')
    vm.a = 'aa'
    nextTick(function () {
      expect(def.update).toHaveBeenCalledWith('aa', '')
      done()
    })
  })

  it('expression function', function () {
    def.isFn = true
    var spy = jasmine.createSpy()
    vm.$options.filters.test = function (fn) {
      spy()
      return function () {
        // call it twice
        fn()
        fn()
      }
    }
    var d = new Directive('test', el, vm, {
      expression: 'a++',
      filters: [{name:'test'}]
    }, def)
    expect(d._watcher).toBeUndefined()
    expect(d.bind).toHaveBeenCalled()
    var wrappedFn = d.update.calls.argsFor(0)[0]
    expect(typeof wrappedFn).toBe('function')
    // test invoke the wrapped fn
    wrappedFn()
    expect(vm.a).toBe(3)
  })

  it('two-way', function (done) {
    def.twoWay = true
    vm.$options.filters.test = {
      write: function (v) {
        return v * 3
      }
    }
    var d = new Directive('test', el, vm, {
      expression: 'a',
      filters: [{name:'test'}]
    }, def)
    d.set(2)
    expect(vm.a).toBe(6)
    nextTick(function () {
      expect(def.update.calls.count()).toBe(2)
      expect(def.update).toHaveBeenCalledWith(6, 1)
      // locked set
      d.set(3, true)
      expect(vm.a).toBe(9)
      nextTick(function () {
        // should have no update calls
        expect(def.update.calls.count()).toBe(2)
        done()
      })
    })
  })

  it('function def', function () {
    var d = new Directive('test', el, vm, {
      expression: 'a'
    }, def.update)
    expect(d.update).toBe(def.update)
    expect(def.update).toHaveBeenCalled()
  })

  it('reuse the same watcher', function (done) {
    var d = new Directive('test', el, vm, {
      expression: 'a',
    }, def)
    var d2 = new Directive('test', el, vm, {
      expression: 'a',
    }, def)
    expect(vm._watcherList.length).toBe(1)
    expect(d._watcher).toBe(d2._watcher)
    d2._teardown()
    expect(d2._watcher).toBeNull()
    expect(vm._watcherList.length).toBe(1)
    vm.a = 2
    nextTick(function () {
      expect(def.update).toHaveBeenCalledWith(2, 1)
      d._teardown()
      expect(vm._watcherList.length).toBe(0)
      done()
    })
  })

})