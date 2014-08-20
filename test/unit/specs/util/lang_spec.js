var _ = require('../../../../src/util')

describe('Util - Language Enhancement', function () {

  it('toString', function () {
    expect(_.toString('hi')).toBe('hi')
    expect(_.toString(1.234)).toBe('1.234')
    expect(_.toString(null)).toBe('')
    expect(_.toString(undefined)).toBe('')
  })

  it('toNumber', function () {
    expect(_.toNumber('12')).toBe(12)
    expect(_.toNumber('1e5')).toBe(1e5)
    expect(_.toNumber('0x2F')).toBe(0x2F)
    expect(_.toNumber(null)).toBe(null)
    expect(_.toNumber(true)).toBe(true)
    expect(_.toNumber('hello')).toBe('hello')
  })

  it('strip quotes', function () {
    expect(_.stripQuotes('"123"')).toBe('123')
    expect(_.stripQuotes("'fff'")).toBe('fff')
    expect(_.stripQuotes("'fff")).toBe(false)
  })

  it('bind', function () {
    var original = function (a) {
      return this.a + a
    }
    var ctx = { a: 'ctx a ' }
    var bound = _.bind(original, ctx)
    var res = bound('arg a')
    expect(res).toBe('ctx a arg a')
  })
  
  it('toArray', function () {
    // should make a copy of original array
    var arr = [1,2,3]
    var res = _.toArray(arr)
    expect(Array.isArray(res)).toBe(true)
    expect(res.toString()).toEqual('1,2,3')
    expect(res).not.toBe(arr)

    // should work on arguments
    ;(function () {
      var res = _.toArray(arguments)
      expect(Array.isArray(res)).toBe(true)
      expect(res.toString()).toEqual('1,2,3')
    })(1,2,3)
  })

  it('extend', function () {
    var from = {a:1,b:2}
    var to = {}
    _.extend(to, from)
    expect(to.a).toBe(from.a)
    expect(to.b).toBe(from.b)
  })

  it('deepMixin', function () {
    var from = Object.create({c:123})
    var to = {}
    Object.defineProperty(from, 'a', {
      enumerable: false,
      configurable: true,
      get: function () {
        return 'AAA'
      }
    })
    Object.defineProperty(from, 'b', {
      enumerable: true,
      configurable: false,
      value: 'BBB'
    })
    _.deepMixin(to, from)
    var descA = Object.getOwnPropertyDescriptor(to, 'a')
    var descB = Object.getOwnPropertyDescriptor(to, 'b')

    expect(descA.enumerable).toBe(false)
    expect(descA.configurable).toBe(true)
    expect(to.a).toBe('AAA')

    expect(descB.enumerable).toBe(true)
    expect(descB.configurable).toBe(false)
    expect(to.b).toBe('BBB')

    expect(to.c).toBeUndefined()
  })

  it('proxy', function () {
    var to = { test2: 'to' }
    var from = { test2: 'from' }
    var val = '123'
    Object.defineProperty(from, 'test', {
      get: function () {
        return val
      },
      set: function (v) {
        val = v
      }
    })
    _.proxy(to, from, 'test')
    expect(to.test).toBe(val)
    to.test = '234'
    expect(val).toBe('234')
    expect(to.test).toBe(val)
    // should not overwrite existing property
    _.proxy(to, from, 'test2')
    expect(to.test2).toBe('to')

  })

  it('isObject', function () {
    expect(_.isObject({})).toBe(true)
    expect(_.isObject([])).toBe(false)
    expect(_.isObject(null)).toBe(false)
    if (_.inBrowser) {
      expect(_.isObject(window)).toBe(false)
    }
  })

  it('isArray', function () {
    expect(_.isArray([])).toBe(true)
    expect(_.isArray({})).toBe(false)
    expect(_.isArray(arguments)).toBe(false)
  })

  it('define', function () {
    var obj = {}
    _.define(obj, 'test', 123)
    expect(obj.test).toBe(123)
    var desc = Object.getOwnPropertyDescriptor(obj, 'test')
    expect(desc.enumerable).toBe(false)

    _.define(obj, 'test2', 123, true)
    expect(obj.test2).toBe(123)
    desc = Object.getOwnPropertyDescriptor(obj, 'test2')
    expect(desc.enumerable).toBe(true)
  })

  it('augment', function () {
    if ('__proto__' in {}) {
      var target = {}
      var proto = {}
      _.augment(target, proto)
      expect(target.__proto__).toBe(proto)
    } else {
      expect(_.augment).toBe(_.deepMixin)
    }
  })

})