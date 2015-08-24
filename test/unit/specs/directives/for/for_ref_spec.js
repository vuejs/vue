var Vue = require('../../../../../src/vue')
var _ = Vue.util

describe('v-for + v-ref', function () {

  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('normal', function (done) {
    var vm = new Vue({
      el: el,
      data: { items: [1, 2, 3, 4, 5] },
      template: '<test v-for="item in items" item="{{item}}" v-ref="test"></test>',
      components: {
        test: {
          props: ['item']
        }
      }
    })
    expect(vm.$.test).toBeTruthy()
    expect(Array.isArray(vm.$.test)).toBe(true)
    expect(vm.$.test[0].item).toBe(1)
    expect(vm.$.test[4].item).toBe(5)
    vm.items = []
    _.nextTick(function () {
      expect(vm.$.test.length).toBe(0)
      vm._directives[0].unbind()
      expect(vm.$.test).toBeNull()
      done()
    })
  })

  it('object', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: {
          a: 1,
          b: 2
        }
      },
      template: '<test v-for="item in items" item="{{item}}" v-ref="test"></test>',
      components: {
        test: {
          props: ['item']
        }
      }
    })
    expect(vm.$.test).toBeTruthy()
    expect(_.isPlainObject(vm.$.test)).toBe(true)
    expect(vm.$.test.a.item).toBe(1)
    expect(vm.$.test.b.item).toBe(2)
    vm.items = { c: 3 }
    _.nextTick(function () {
      expect(Object.keys(vm.$.test).length).toBe(1)
      expect(vm.$.test.c.item).toBe(3)
      vm._directives[0].unbind()
      expect(vm.$.test).toBeNull()
      done()
    })
  })

  it('nested', function () {
    var vm = new Vue({
      el: el,
      template: '<c1 v-ref="c1"></c1>',
      components: {
        c1: {
          template: '<div v-for="n in 2" v-ref="c2"></div>'
        }
      }
    })
    expect(vm.$.c1 instanceof Vue).toBe(true)
    expect(vm.$.c2).toBeUndefined()
    expect(Array.isArray(vm.$.c1.$.c2)).toBe(true)
    expect(vm.$.c1.$.c2.length).toBe(2)
  })
})
