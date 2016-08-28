var filters = require('src/filters')

describe('Filters', function () {
  it('json read', function () {
    var filter = filters.json.read
    var obj = {a: {b: 2}}
    expect(filter(obj)).toBe(JSON.stringify(obj, null, 2))
    expect(filter(obj, 4)).toBe(JSON.stringify(obj, null, 4))
    expect(filter(obj, 0)).toBe(JSON.stringify(obj, null, 0))
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
    // multi args where selected argument is empty string
    expect(filter(1, '', 'nd', 'rd', 'th')).toBe('')
  })

  it('currency', function () {
    var filter = filters.currency
    // default
    expect(filter(1234)).toBe('$1,234.00')
    expect(filter(1234.45)).toBe('$1,234.45')
    expect(filter(123443434.4343434)).toBe('$123,443,434.43')
    expect(filter(0.99)).toBe('$0.99')
    expect(filter(0.99999)).toBe('$1.00')
    expect(filter(0.76)).toBe('$0.76')
    // sign arg
    expect(filter(2134, '@')).toBe('@2,134.00')
    // no symbol
    expect(filter(2134, '')).toBe('2,134.00')
    // decimal places
    expect(filter(1234, '$', 0)).toBe('$1,234')
    // if decimal places are present, currency is required
    expect(filter(1234, '', 2)).toBe('1,234.00')
    expect(filter(123.4, '$', 3)).toBe('$123.400')
    expect(filter(-12345, 'VND', 0)).toBe('-VND12,345')
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

  it('debounce', function (done) {
    var filter = filters.debounce
    expect(filter(null)).toBeUndefined()
    var spy = jasmine.createSpy('filter:debounce')
    var handler = filter(spy)
    handler()
    expect(spy).not.toHaveBeenCalled()
    handler = filter(spy)
    handler()
    setTimeout(function () {
      expect(spy).toHaveBeenCalled()
    }, 400)
    var spy2 = jasmine.createSpy('filter:debounce')
    handler = filter(spy2, 450)
    handler()
    handler()
    setTimeout(function () {
      expect(spy2).not.toHaveBeenCalled()
    }, 400)
    setTimeout(function () {
      expect(spy2.calls.count()).toBe(1)
      done()
    }, 500)
  })

  it('limitBy', function () {
    var filter = filters.limitBy
    var arr = [1, 2, 3]
    var res = filter(arr, false)
    expect(res).toBe(arr)
    res = filter(arr, 1)
    assertArray(res, [1])
    res = filter(arr, 10)
    assertArray(res, [1, 2, 3])
    res = filter(arr, -1)
    assertArray(res, [1, 2])
    // with offsets, note offsets are 0 bound (as expected)
    res = filter(arr, 1, 1)
    assertArray(res, [2])
    res = filter(arr, 2, 1)
    assertArray(res, [2, 3])
    res = filter(arr, 1, 2)
    assertArray(res, [3])
  })

  it('filterBy', function () {
    var filter = filters.filterBy
    var arr = [
      { a: 1, b: { c: 'hello' }},
      { a: 2, b: 'hello' },
      { a: 3, b: ['yoyo'] }
    ]
    var res
    // normal
    res = filter(arr, 'hello')
    assertArray(res, [arr[0], arr[1]])
    // data key
    res = filter(arr, 'hello', 'b.c')
    assertArray(res, [arr[0]])
    // delimiter
    res = filter(arr, 'hello', 'in', 'b.c')
    assertArray(res, [arr[0]])
    // no search key
    res = filter(arr, null)
    expect(res).toBe(arr)
    // number search key
    res = filter(arr, 2)
    assertArray(res, [arr[1]])
    // search in sub array
    res = filter(arr, 'yoyo')
    assertArray(res, [arr[2]])
    // filter by false (#928)
    arr = [{a: false}, {b: true}]
    res = filter(arr, false)
    assertArray(res, [arr[0]])
    // filter by a function
    res = filter(arr, function (val) {
      return val.b === true
    })
    assertArray(res, [arr[1]])
  })

  it('filterBy multiple keys', function () {
    var filter = filters.filterBy
    var arr = [
      { firstname: 'A', lastname: 'B' },
      { firstname: 'C', lastname: 'B' },
      { firstname: 'A', lastname: 'D' }
    ]
    // multiple string keys
    var res
    res = filter(arr, '', 'in', 'firstname', 'lastname')
    assertArray(res, [arr[0], arr[1], arr[2]])
    res = filter(arr, 'A', 'in', 'firstname', 'lastname')
    assertArray(res, [arr[0], arr[2]])
    // array of keys
    res = filter(arr, 'B', ['firstname', 'lastname'])
    assertArray(res, [arr[0], arr[1]])
    // multiple arrays of keys
    res = filter(arr, 'C', 'in', ['firstname'], ['lastname'])
    assertArray(res, [arr[1]])
    res = filter(arr, 'A', ['firstname', 'lastname'], [])
    assertArray(res, [arr[0], arr[2]])
  })

  it('orderBy', function () {
    var filter = filters.orderBy
    var arr = [
      { a: { b: 0 }, c: 'b' },
      { a: { b: 2 }, c: 'c' },
      { a: { b: 1 }, c: 'a' }
    ]
    var res
    // sort key
    res = filter(arr, 'a.b')
    assertArray(res, [arr[0], arr[2], arr[1]])
    // reverse key
    res = filter(arr, 'a.b', -1)
    assertArray(res, [arr[1], arr[2], arr[0]])
    // literal asc
    res = filter(arr, 'c', 1)
    assertArray(res, [arr[2], arr[0], arr[1]])
    // no sort key
    res = filter(arr, null)
    expect(res).toBe(arr)
    res = filter(arr)
    expect(res).toBe(arr)
  })

  it('orderBy on Object-converted array', function () {
    // object converted
    var filter = filters.orderBy
    var arr = [
      { $key: 'a', $value: 3 },
      { $key: 'c', $value: 1 },
      { $key: 'b', $value: 2 }
    ]
    var res = filter(arr, '$key')
    assertArray(res, [arr[0], arr[2], arr[1]])
    res = filter(arr, '$value')
    assertArray(res, [arr[1], arr[2], arr[0]])
    // normal keys
    arr = [
      { $key: 'a', $value: { v: 3 } },
      { $key: 'c', $value: { v: 1 } },
      { $key: 'b', $value: { v: 2 } }
    ]
    res = filter(arr, 'v')
    assertArray(res, [arr[1], arr[2], arr[0]])
  })

  it('orderBy primitive values', function () {
    var filter = filters.orderBy
    var arr = [9, 11, 1, 2]
    var res = filter(arr, true)
    assertArray(res, [arr[2], arr[3], arr[0], arr[1]])
  })

  it('orderBy multiple fields', function () {
    var filter = filters.orderBy
    var arr = [
      { a: 1, b: 1, c: 1 }, // 0
      { a: 0, b: 1, c: 1 }, // 1
      { a: 1, b: 2, c: 0 }, // 2
      { a: 1, b: 0, c: 0 }, // 3
      { a: 0, b: 0, c: 0 }, // 4
      { a: 0, b: 1, c: 0 }  // 5
    ]
    var res
    // sort two keys
    res = filter(arr, ['a', 'b'])
    assertArray(res, [arr[4], arr[1], arr[5], arr[3], arr[0], arr[2]])
    res = filter(arr, 'a', 'b')
    assertArray(res, [arr[4], arr[1], arr[5], arr[3], arr[0], arr[2]])

    // sort two keys with order
    res = filter(arr, ['a', 'b'], 1)
    assertArray(res, [arr[4], arr[1], arr[5], arr[3], arr[0], arr[2]])
    res = filter(arr, 'a', 'b', 1)
    assertArray(res, [arr[4], arr[1], arr[5], arr[3], arr[0], arr[2]])

    // sort three keys
    res = filter(arr, ['a', 'b', 'c'])
    assertArray(res, [arr[4], arr[5], arr[1], arr[3], arr[0], arr[2]])
    res = filter(arr, 'a', 'b', 'c')
    assertArray(res, [arr[4], arr[5], arr[1], arr[3], arr[0], arr[2]])

    // reverse two key. Preserves order when equal: 1 then 5
    res = filter(arr, ['a', 'b'], -1)
    assertArray(res, [arr[2], arr[0], arr[3], arr[1], arr[5], arr[4]])
    res = filter(arr, 'a', 'b', -1)
    assertArray(res, [arr[2], arr[0], arr[3], arr[1], arr[5], arr[4]])
  })

  it('orderBy using a compare function', function () {
    var filter = filters.orderBy
    var arr = [9, 11, 1, 2]
    var res = filter(arr, evenBeforeOdd)
    assertArray(res, [arr[3], arr[2], arr[0], arr[1]])
    res = filter(arr, evenBeforeOdd, 1)
    assertArray(res, [arr[3], arr[2], arr[0], arr[1]])
    res = filter(arr, evenBeforeOdd, -1)
    assertArray(res, [arr[1], arr[0], arr[2], arr[3]])
  })
})

function evenBeforeOdd (a, b) {
  if (a % 2 === 0) {
    if (b % 2 === 0) return a - b
    else return -1
  } else if (b % 2 === 0) return 1
    else return a - b
}

function assertArray (res, expectations) {
  expect(res.length).toBe(expectations.length)
  expectations.forEach(function (exp, i) {
    expect(exp).toBe(res[i])
  })
}

function assertNumberAndFalsy (filter) {
  // should stringify numbers
  expect(filter(12345)).toBe('12345')
  expect(filter(0)).toBe('0')
  expect(filter(undefined)).toBe('')
  expect(filter(null)).toBe('')
  expect(filter(false)).toBe('')
}
