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
    expect(vm.$children.indexOf(child)).toBe(0)
  })
})
