var Vue = require('src')
var Directive = require('src/directive')
var nextTick = Vue.nextTick

describe('Directive', function () {
  var el, vm, def
  beforeEach(function () {
    el = document.createElement('div')
    def = {
      params: ['foo', 'keBab'],
      paramWatchers: {
        foo: jasmine.createSpy('foo')
      },
      bind: jasmine.createSpy('bind'),
      update: jasmine.createSpy('update'),
      unbind: jasmine.createSpy('unbind')
    }
    vm = new Vue({
      data: {
        a: 1,
        b: { c: { d: 2 }}
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
    var d = new Directive({
      name: 'test',
      def: def,
      expression: 'a',
      modifiers: {
        literal: false
      },
      filters: [{ name: 'test' }]
    }, vm, el)
    d._bind()
    // properties
    expect(d.el).toBe(el)
    expect(d.name).toBe('test')
    expect(d.vm).toBe(vm)
    expect(d.expression).toBe('a')
    expect(d.literal).toBe(false)
    // init calls
    expect(def.bind).toHaveBeenCalled()
    expect(def.update).toHaveBeenCalledWith(2)
    expect(d._bound).toBe(true)
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

  it('literal', function () {
    var d = new Directive({
      name: 'test',
      expression: 'a',
      raw: 'a',
      def: def,
      modifiers: {
        literal: true
      }
    }, vm, el)
    d._bind()
    expect(d._watcher).toBeUndefined()
    expect(d.expression).toBe('a')
    expect(d.bind).toHaveBeenCalled()
    expect(d.update).toHaveBeenCalledWith('a')
  })

  it('inline statement', function () {
    def.acceptStatement = true
    var spy = jasmine.createSpy()
    vm.$options.filters.test = function (fn) {
      spy()
      return function () {
        // call it twice
        fn()
        fn()
      }
    }
    var d = new Directive({
      name: 'test',
      expression: 'a++',
      filters: [{name: 'test'}],
      def: def
    }, vm, el)
    d._bind()
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
    var d = new Directive({
      name: 'test',
      expression: 'a',
      filters: [{name: 'test'}],
      def: def
    }, vm, el)
    d._bind()
    d.set(2)
    expect(vm.a).toBe(6)
    nextTick(function () {
      // should have no update calls
      expect(def.update.calls.count()).toBe(1)
      done()
    })
  })

  it('deep', function (done) {
    def.deep = true
    var d = new Directive({
      name: 'test',
      expression: 'b',
      def: def
    }, vm, el)
    d._bind()
    vm.b.c.d = 3
    nextTick(function () {
      expect(def.update.calls.count()).toBe(2)
      done()
    })
  })

  it('function def', function () {
    var d = new Directive({
      name: 'test',
      expression: 'a',
      def: def.update
    }, vm, el)
    d._bind()
    expect(d.update).toBe(def.update)
    expect(def.update).toHaveBeenCalled()
  })

  it('static params', function () {
    el.setAttribute('foo', 'hello')
    el.setAttribute('ke-bab', 'yo')
    var d = new Directive({
      name: 'test',
      def: def,
      expression: 'a'
    }, vm, el)
    d._bind()
    expect(d.params.foo).toBe('hello')
    expect(d.params.keBab).toBe('yo')
  })

  it('dynamic params', function (done) {
    el.setAttribute(':foo', 'a')
    el.setAttribute(':ke-bab', '123')
    var d = new Directive({
      name: 'test',
      def: def,
      expression: 'a'
    }, vm, el)
    d._bind()
    expect(d.params.foo).toBe(vm.a)
    expect(d.params.keBab).toBe(123)
    vm.a = 2
    nextTick(function () {
      expect(def.paramWatchers.foo).toHaveBeenCalledWith(2, 1)
      expect(d.params.foo).toBe(vm.a)
      done()
    })
  })
})
