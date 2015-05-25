var _ = require('../../../../src/util')

describe('Util - Misc', function () {

  it('checkComponent', function () {
    var el = document.createElement('component')
    // <component> with no is attr
    var res = _.checkComponent(el)
    expect(res).toBe(null)
    // <component is="...">
    el.setAttribute('is', '{{what}}')
    res = _.checkComponent(el)
    expect(res).toBe('{{what}}')
    // custom element, not defined
    el = document.createElement('test')
    res = _.checkComponent(el, {
      components: {}
    })
    expect(res).toBeUndefined()
    // custom element, defined
    res = _.checkComponent(el, {
      components: { test: true }
    })
    expect(res).toBe('test')
  })

  it('resolveFilters', function () {
    var filters = [
      { name: 'a', args: [{ value: 'a', dynamic: false }] },
      { name: 'b', args: [{ value: 'b', dynamic: true }]},
      { name: 'c' }
    ]
    var vm = {
      _asset: function (type, id) {
        return this.$options[type][id]
      },
      $get: function (key) {
        var data = {
          b: 'BB'
        }
        return data[key]
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

    var readB = res.read[1].call(vm, 2)
    expect(readB.id).toBe('b')
    expect(readB.value).toBe(2)
    expect(readB.arg).toBe('BB')
    
    var writeB = res.write[0](3)
    expect(writeB.id).toBe('bw')
    expect(writeB.value).toBe(3)
    expect(writeB.arg).toBe('BB')
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