var _ = require('../../../../src/util')

describe('Util - Filter', function () {
  
  it('resolveFilters', function () {
    var filters = [
      { name: 'a', args: ['a'] },
      { name: 'b', args: ['b']},
      { name: 'c' }
    ]
    var vm = {
      _asset: function (type, id) {
        return this.$options[type][id]
      },
      $options: {
        filters: {
          a: function (v, arg) {
            return { id: 'a', value: v, arg: arg }
          },
          b: {
            read: function (v, arg) {
              return { id: 'b', value: v, arg: arg }
            },
            write: function (v, oldVal, arg) {
              return { id: 'bw', value: v, arg: arg }
            }
          }
        }
      }
    }
    var target = {
      value: 'v'
    }
    var res = _.resolveFilters(vm, filters, target)
    expect(res.read.length).toBe(2)
    expect(res.write.length).toBe(1)

    var readA = res.read[0](1)
    expect(readA.id).toBe('a')
    expect(readA.value).toBe(1)
    expect(readA.arg).toBe('a')

    var readB = res.read[1](2)
    expect(readB.id).toBe('b')
    expect(readB.value).toBe(2)
    expect(readB.arg).toBe('b')
    
    var writeB = res.write[0](3)
    expect(writeB.id).toBe('bw')
    expect(writeB.value).toBe(3)
    expect(writeB.arg).toBe('b')
  })

  it('applyFilters', function () {
    var filters = [
      function (v) {
        return v + 2
      },
      function (v) {
        return v + 3
      }
    ]
    var res = _.applyFilters(1, filters)
    expect(res).toBe(6)
  })

})