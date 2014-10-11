var Vue = require('../../../../src/vue')

describe('Child API', function () {

  var vm
  beforeEach(function () {
    vm = new Vue({
      data: {
        a: 1,
        b: 1
      },
      directives: {
        test: function () {}
      }
    })
  })

  it('default', function () {
    var child = vm.$addChild()
    expect(child instanceof Vue).toBe(true)
    expect(child.a).toBeUndefined()
    expect(child.$parent).toBe(vm)
    expect(child.$root).toBe(vm)
    expect(vm._children.indexOf(child)).toBe(0)
    expect(child.$options.directives.test).toBeTruthy()
  })

  it('inherit scope', function () {
    var child = vm.$addChild({
      inherit: true,
      data: {
        b: 2
      }
    })
    expect(child.a).toBe(1)
    expect(child.b).toBe(2)
    expect(child.constructor.prototype).toBe(vm)
  })

  it('with constructor', function () {
    var Ctor = Vue.extend({
      inherit: true,
      data: function () {
        return {
          c: 3
        }
      }
    })
    var child = vm.$addChild({
      data: {
        b: 2
      }
    }, Ctor)
    expect(child.a).toBe(1)
    expect(child.b).toBe(2)
    expect(child.c).toBe(3)
    expect(child.constructor.options).toBe(Ctor.options)
  })

  it('cache constructor', function () {
    var Ctor = Vue.extend({
      inherit: true
    })
    var child1 = vm.$addChild(null, Ctor)
    var child2 = vm.$addChild(null, Ctor)
    expect(child1.constructor).toBe(child2.constructor)
  })

  it('Use proper constructor name with inherit', function () {
    var Ctor = Vue.extend({
      name: 'vue-test',
      inherit: true
    })
    var child = vm.$addChild(null, Ctor)
    expect(child.constructor.toString().match(/^function VueTest\s?\(/)).toBeTruthy()
  })

})