var Vue = require('src')
var _ = require('src/util')
var config = require('src/config')

describe('Global API', function () {

  beforeEach(function () {
    spyWarns()
  })

  it('exposed utilities', function () {
    expect(Vue.util).toBe(_)
    expect(Vue.nextTick).toBe(_.nextTick)
    expect(Vue.config).toBe(config)
  })

  it('extend', function () {
    var Test = Vue.extend({
      name: 'test',
      a: 1,
      b: 2
    })
    expect(Test.options.a).toBe(1)
    expect(Test.options.b).toBe(2)
    expect(Test.super).toBe(Vue)
    // function.name is not available in IE
    expect(Test.toString().match(/^function Test\s?\(/)).toBeTruthy()
    var t = new Test({
      a: 2
    })
    expect(t.$options.a).toBe(2)
    expect(t.$options.b).toBe(2)
    // inheritance
    var Test2 = Test.extend({
      a: 2
    })
    expect(Test2.options.a).toBe(2)
    expect(Test2.options.b).toBe(2)
    var t2 = new Test2({
      a: 3
    })
    expect(t2.$options.a).toBe(3)
    expect(t2.$options.b).toBe(2)
  })

  it('extend warn invalid names', function () {
    Vue.extend({ name: '123' })
    expect(hasWarned('Invalid component name: 123')).toBe(true)
    Vue.extend({ name: '_fesf' })
    expect(hasWarned('Invalid component name: _fesf')).toBe(true)
    Vue.extend({ name: 'Some App' })
    expect(hasWarned('Invalid component name: Some App')).toBe(true)
  })

  it('use', function () {
    var def = {}
    var options = {}
    var pluginStub = {
      install: function (Vue, opts) {
        Vue.directive('plugin-test', def)
        expect(opts).toBe(options)
      }
    }
    Vue.use(pluginStub, options)
    expect(Vue.options.directives['plugin-test']).toBe(def)
    delete Vue.options.directives['plugin-test']
    // use a function
    Vue.use(pluginStub.install, options)
    expect(Vue.options.directives['plugin-test']).toBe(def)
    delete Vue.options.directives['plugin-test']
  })

  it('global mixin', function () {
    var options = Vue.options
    var spy = jasmine.createSpy('global mixin')
    Vue.mixin({
      created: function () {
        spy(this.$options.myOption)
      }
    })
    new Vue({
      myOption: 'hello'
    })
    expect(spy).toHaveBeenCalledWith('hello')
    Vue.options = options
  })

  describe('Asset registration', function () {

    var Test = Vue.extend()

    it('directive / elementDirective / filter / transition', function () {
      var assets = ['directive', 'elementDirective', 'filter', 'transition']
      assets.forEach(function (type) {
        var def = {}
        Test[type]('test', def)
        expect(Test.options[type + 's'].test).toBe(def)
        expect(Test[type]('test')).toBe(def)
        // extended registration should not pollute global
        expect(Vue.options[type + 's'].test).toBeUndefined()
      })
    })

    it('component', function () {
      var def = { a: 1 }
      Test.component('test', def)
      var component = Test.options.components.test
      expect(typeof component).toBe('function')
      expect(component.super).toBe(Vue)
      expect(component.options.a).toBe(1)
      expect(component.options.name).toBe('test')
      expect(Test.component('test')).toBe(component)
      // already extended
      Test.component('test2', component)
      expect(Test.component('test2')).toBe(component)
      // extended registration should not pollute global
      expect(Vue.options.components.test).toBeUndefined()
    })

  })

})
