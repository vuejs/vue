var Vue = require('../../../../src/vue')

describe('misc', function () {

  it('_applyFilter', function () {
    var vm = new Vue({
      filters: {
        a: {
          read: function (a, b) {
            return a + b
          }
        },
        b: function (a, b) {
          return a - b
        }
      }
    })
    expect(vm._applyFilter('a', [1, 1])).toBe(2)
    expect(vm._applyFilter('b', [1, 1])).toBe(0)
  })

})