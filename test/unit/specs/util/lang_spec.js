var _ = require('src/util')

describe('Util - Language Enhancement', function () {
  it('hasOwn', function () {
    var obj1 = { a: 1 }
    expect(_.hasOwn(obj1, 'a')).toBe(true)
    var obj2 = Object.create(null)
    obj2.a = 2
    expect(_.hasOwn(obj2, 'a')).toBe(true)
  })

  it('isLiteral', function () {
    expect(_.isLiteral('123')).toBe(true)
    expect(_.isLiteral('12.3')).toBe(true)
    expect(_.isLiteral('true')).toBe(true)
    expect(_.isLiteral(' false ')).toBe(true)
    expect(_.isLiteral('"foo"')).toBe(true)
    expect(_.isLiteral(" 'foo' ")).toBe(true)
    expect(_.isLiteral('a.b.c')).toBe(false)
    expect(_.isLiteral('1 + 1')).toBe(false)
  })

  it('toString', function () {
    expect(_._toString('foo')).toBe('foo')
    expect(_._toString(1.234)).toBe('1.234')
    expect(_._toString(null)).toBe('')
    expect(_._toString(undefined)).toBe('')
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
    expect(_.stripQuotes("'fff")).toBe("'fff")
  })

  it('camelize', function () {
    expect(_.camelize('abc')).toBe('abc')
    expect(_.camelize('some-long-name')).toBe('someLongName')
  })

  it('hyphenate', function () {
    expect(_.hyphenate('fooBar')).toBe('foo-bar')
    expect(_.hyphenate('a1BfC')).toBe('a1-bf-c')
    expect(_.hyphenate('already-With-Hyphen')).toBe('already-with-hyphen')
    expect(_.hyphenate('ABigApple')).toBe('a-big-apple')
  })

  it('classify', function () {
    expect(_.classify('abc')).toBe('Abc')
    expect(_.classify('foo-bar')).toBe('FooBar')
    expect(_.classify('foo_bar')).toBe('FooBar')
    expect(_.classify('foo/bar')).toBe('FooBar')
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
    var arr = [1, 2, 3]
    var res = _.toArray(arr)
    expect(Array.isArray(res)).toBe(true)
    expect(res.toString()).toEqual('1,2,3')
    expect(res).not.toBe(arr)

    // should work on arguments
    ;(function () {
      var res = _.toArray(arguments)
      expect(Array.isArray(res)).toBe(true)
      expect(res.toString()).toEqual('1,2,3')
    })(1, 2, 3)
  })

  it('extend', function () {
    var from = {a: 1, b: 2}
    var to = {}
    var res = _.extend(to, from)
    expect(to.a).toBe(from.a)
    expect(to.b).toBe(from.b)
    expect(res).toBe(to)
  })

  it('isObject', function () {
    expect(_.isObject({})).toBe(true)
    expect(_.isObject([])).toBe(true)
    expect(_.isObject(null)).toBeFalsy()
    expect(_.isObject(123)).toBeFalsy()
    expect(_.isObject(true)).toBeFalsy()
    expect(_.isObject('foo')).toBeFalsy()
    expect(_.isObject(undefined)).toBeFalsy()
    expect(_.isObject(function () {})).toBeFalsy()
  })

  it('isPlainObject', function () {
    expect(_.isPlainObject({})).toBe(true)
    expect(_.isPlainObject([])).toBe(false)
    expect(_.isPlainObject(null)).toBe(false)
    expect(_.isPlainObject(null)).toBeFalsy()
    expect(_.isPlainObject(123)).toBeFalsy()
    expect(_.isPlainObject(true)).toBeFalsy()
    expect(_.isPlainObject('foo')).toBeFalsy()
    expect(_.isPlainObject(undefined)).toBeFalsy()
    expect(_.isPlainObject(function () {})).toBe(false)
    expect(_.isPlainObject(window)).toBe(false)
  })

  it('isArray', function () {
    expect(_.isArray([])).toBe(true)
    expect(_.isArray({})).toBe(false)
    expect(_.isArray(arguments)).toBe(false)
  })

  it('define', function () {
    var obj = {}
    _.def(obj, 'test', 123)
    expect(obj.test).toBe(123)
    var desc = Object.getOwnPropertyDescriptor(obj, 'test')
    expect(desc.enumerable).toBe(false)

    _.def(obj, 'test2', 123, true)
    expect(obj.test2).toBe(123)
    desc = Object.getOwnPropertyDescriptor(obj, 'test2')
    expect(desc.enumerable).toBe(true)
  })

  it('debounce', function (done) {
    var count = 0
    var fn = _.debounce(function () {
      count++
    }, 100)
    fn()
    setTimeout(fn, 10)
    setTimeout(fn, 20)
    setTimeout(function () {
      expect(count).toBe(0)
    }, 30)
    setTimeout(function () {
      expect(count).toBe(1)
      done()
    }, 200)
  })

  it('looseEqual', function () {
    expect(_.looseEqual(1, '1')).toBe(true)
    expect(_.looseEqual(null, undefined)).toBe(true)
    expect(_.looseEqual({a: 1}, {a: 1})).toBe(true)
    expect(_.looseEqual({a: 1}, {a: 2})).toBe(false)
    expect(_.looseEqual({}, [])).toBe(false)
  })
})
