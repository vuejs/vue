var Vue = require('src')
var _ = Vue.util

describe('v-for + ref', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('normal', function (done) {
    var vm = new Vue({
      el: el,
      data: { items: [1, 2, 3, 4, 5] },
      template: '<test v-for="item in items" :item="item" v-ref:test></test>',
      components: {
        test: {
          props: ['item']
        }
      }
    })
    expect(vm.$refs.test).toBeTruthy()
    expect(Array.isArray(vm.$refs.test)).toBe(true)
    expect(vm.$refs.test[0].item).toBe(1)
    expect(vm.$refs.test[4].item).toBe(5)
    vm.items = []
    _.nextTick(function () {
      expect(vm.$refs.test.length).toBe(0)
      vm._directives[0].unbind()
      expect(vm.$refs.test).toBeNull()
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
      template: '<test v-for="item in items" :item="item" v-ref:test></test>',
      components: {
        test: {
          props: ['item']
        }
      }
    })
    expect(vm.$refs.test).toBeTruthy()
    expect(_.isPlainObject(vm.$refs.test)).toBe(true)
    expect(vm.$refs.test.a.item).toBe(1)
    expect(vm.$refs.test.b.item).toBe(2)
    vm.items = { c: 3 }
    _.nextTick(function () {
      expect(Object.keys(vm.$refs.test).length).toBe(1)
      expect(vm.$refs.test.c.item).toBe(3)
      vm._directives[0].unbind()
      expect(vm.$refs.test).toBeNull()
      done()
    })
  })

  it('nested', function () {
    var vm = new Vue({
      el: el,
      template: '<c1 v-ref:c1></c1>',
      components: {
        c1: {
          template: '<div v-for="n in 2" v-ref:c2></div>'
        }
      }
    })
    expect(vm.$refs.c1 instanceof Vue).toBe(true)
    expect(vm.$refs.c2).toBeUndefined()
    expect(Array.isArray(vm.$refs.c1.$refs.c2)).toBe(true)
    expect(vm.$refs.c1.$refs.c2.length).toBe(2)
  })
})
