var Vue = require('../../../../src/vue')
var filters = require('../../../../src/filters')

describe('Filters', function () {

  it('json read', function () {
    var filter = filters.json.read
    var obj = {a:{b:2}}
    expect(filter(obj)).toBe(JSON.stringify(obj, null, 2))
    expect(filter(obj, 4)).toBe(JSON.stringify(obj, null, 4))
    // plain string
    expect(filter('1234')).toBe('1234')
  })

  it('json write', function () {
    var filter = filters.json.write
    var obj = '{"a":{"b":2}}'
    expect(JSON.stringify(filter(obj))).toBe(obj)
    // error condition
    var invalidJSON = '{"a":}'
    expect(filter(invalidJSON)).toBe(invalidJSON)
  })
  
  it('capitalize', function () {
    var filter = filters.capitalize
    var res = filter('fsefsfsef')
    expect(res.charAt(0)).toBe('F')
    expect(res.slice(1)).toBe('sefsfsef')
    assertNumberAndFalsy(filter)
  })

  it('uppercase', function () {
    var filter = filters.uppercase
    expect(filter('fsefef')).toBe('FSEFEF')
    assertNumberAndFalsy(filter)
  })

  it('lowercase', function () {
    var filter = filters.lowercase
    expect(filter('AWEsoME')).toBe('awesome')
    assertNumberAndFalsy(filter)
  })

  it('pluralize', function () {
    var filter = filters.pluralize
    // single arg
    var arg = 'item'
    expect(filter(0, arg)).toBe('items')
    expect(filter(1, arg)).toBe('item')
    expect(filter(2, arg)).toBe('items')
    // multi args
    expect(filter(0, 'st', 'nd', 'rd', 'th')).toBe('th')
    expect(filter(1, 'st', 'nd', 'rd', 'th')).toBe('st')
    expect(filter(2, 'st', 'nd', 'rd', 'th')).toBe('nd')
    expect(filter(3, 'st', 'nd', 'rd', 'th')).toBe('rd')
    expect(filter(4, 'st', 'nd', 'rd', 'th')).toBe('th')
  })

  it('currency', function () {
    var filter = filters.currency
    // default
    expect(filter(1234)).toBe('$1,234.00')
    expect(filter(1234.45)).toBe('$1,234.45')
    expect(filter(123443434.4343434)).toBe('$123,443,434.43')
    expect(filter(0.99999)).toBe('$0.99')
    // sign arg
    expect(filter(2134, '@')).toBe('@2,134.00')
    // falsy, infinity and 0
    expect(filter(0)).toBe('$0.00')
    expect(filter(false)).toBe('')
    expect(filter(null)).toBe('')
    expect(filter(undefined)).toBe('')
    expect(filter(Infinity)).toBe('')
    // negative numbers
    expect(filter(-50)).toBe('-$50.00')
    expect(filter(-150.43)).toBe('-$150.43')
    expect(filter(-1500.4343434)).toBe('-$1,500.43')
  })

  it('key', function () {
    var filter = filters.key
    expect(filter(null)).toBeUndefined()
    var spy = jasmine.createSpy('filter:key')
    var handler = filter(spy, 'enter')
    handler({ keyCode: 0 })
    expect(spy).not.toHaveBeenCalled()
    handler({ keyCode: 13 })
    expect(spy).toHaveBeenCalled()
    // direct keycode
    spy = jasmine.createSpy('filter:key')
    handler = filter(spy, 13)
    handler({ keyCode: 0 })
    expect(spy).not.toHaveBeenCalled()
    handler({ keyCode: 13 })
    expect(spy).toHaveBeenCalled()
  })

  it('filterBy', function () {
    var filter = filters.filterBy
    var arr = [
      { a: 1, b: { c: 'hello' }},
      { a: 2, b: 'hello'},
      { a: 3, b: 2 }
    ]
    var vm = new Vue({
      data: {
        search: {
          key: 'hello',
          datakey: 'b.c',
          n: 2
        }
      }
    })
    var res
    // normal
    res = filter.call(vm, arr, 'search.key')
    expect(res.length).toBe(2)
    expect(res[0]).toBe(arr[0])
    expect(res[1]).toBe(arr[1])
    // data key
    res = filter.call(vm, arr, 'search.key', 'search.datakey')
    expect(res.length).toBe(1)
    expect(res[0]).toBe(arr[0])
    // quotes
    res = filter.call(vm, arr, "'hello'", "'b.c'")
    expect(res.length).toBe(1)
    expect(res[0]).toBe(arr[0])
    // delimiter
    res = filter.call(vm, arr, 'search.key', 'in', 'search.datakey')
    expect(res.length).toBe(1)
    expect(res[0]).toBe(arr[0])
    // no search key
    res = filter.call(vm, arr, 'abc')
    expect(res).toBe(arr)
    // number search key
    res = filter.call(vm, arr, 'search.n')
    expect(res[0]).toBe(arr[1])
  })

  it('orderBy', function () {
    var filter = filters.orderBy
    var arr = [
      { a: { b: 0 }, c: 'b'},
      { a: { b: 2 }, c: 'c'},
      { a: { b: 1 }, c: 'a'}
    ]
    var res
    // sort key
    res = filter.call(new Vue({
      data: {
        sortby: 'a.b',
      }
    }), arr, 'sortby')
    expect(res.length).toBe(3)
    expect(res[0].a.b).toBe(0)
    expect(res[1].a.b).toBe(1)
    expect(res[2].a.b).toBe(2)
    // reverse key
    res = filter.call(new Vue({
      data: { sortby: 'a.b', reverse: true }
    }), arr, 'sortby', 'reverse')
    expect(res.length).toBe(3)
    expect(res[0].a.b).toBe(2)
    expect(res[1].a.b).toBe(1)
    expect(res[2].a.b).toBe(0)
    // literal args
    res = filter.call(new Vue(), arr, "'c'", '-1')
    expect(res.length).toBe(3)
    expect(res[0].c).toBe('c')
    expect(res[1].c).toBe('b')
    expect(res[2].c).toBe('a')
    // negate reverse
    res = filter.call(new Vue({
      data: { reverse: true }
    }), arr, "'c'", '!reverse')
    expect(res.length).toBe(3)
    expect(res[0].c).toBe('a')
    expect(res[1].c).toBe('b')
    expect(res[2].c).toBe('c')
    // no sort key
    res = filter.call(new Vue(), arr, 'abc')
    expect(res).toBe(arr)
  })
})

function assertNumberAndFalsy (filter) {
  // should stringify numbers
  expect(filter(12345)).toBe('12345')
  expect(filter(0)).toBe('0')
  expect(filter(undefined)).toBe('')
  expect(filter(null)).toBe('')
  expect(filter(false)).toBe('')
}