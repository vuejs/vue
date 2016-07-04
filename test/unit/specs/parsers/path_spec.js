var Path = require('src/parsers/path')
var _ = require('src/util')

function assertPath (str, expected) {
  var path = Path.parsePath(str)
  var res = pathMatch(path, expected)
  expect(res).toBe(true)
  if (!res) {
    console.log('Path parse failed: ', str, path)
  }
}

function assertInvalidPath (str) {
  var path = Path.parsePath(str)
  expect(path).toBeUndefined()
}

function pathMatch (a, b) {
  if (a.length !== b.length) {
    return false
  }
  for (var i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

describe('Path Parser', function () {
  it('parse simple paths', function () {
    assertPath('', [])
    assertPath(' ', [])
    assertPath('a', ['a'])
    assertPath('a.b', ['a', 'b'])
    assertPath('a. b', ['a', 'b'])
    assertPath('a .b', ['a', 'b'])
    assertPath('a . b', ['a', 'b'])
    assertPath(' a . b ', ['a', 'b'])
    assertPath('a[0]', ['a', '0'])
    assertPath('a [0]', ['a', '0'])
    assertPath('a[0][1]', ['a', '0', '1'])
    assertPath('a [ 0 ] [ 1 ] ', ['a', '0', '1'])
    assertPath('[1234567890] ', ['1234567890'])
    assertPath(' [1234567890] ', ['1234567890'])
    assertPath('opt0', ['opt0'])
    assertPath('$foo.$bar._baz', ['$foo', '$bar', '_baz'])
    assertPath('foo["baz"]', ['foo', 'baz'])
  })

  it('parse dynamic paths', function () {
    assertPath('foo["b\\"az"]', ['foo', '*"b\\"az"'])
    assertPath("foo['b\\'az']", ['foo', "*'b\\'az'"])
    assertPath('a[b][c]', ['a', '*b', '*c'])
    assertPath('a[ b ][ c ]', ['a', '*b', '*c'])
    assertPath('a[b.c]', ['a', '*b.c'])
    assertPath('a[b + "c"]', ['a', '*b + "c"'])
    assertPath('a[b[c]]', ['a', '*b[c]'])
    assertPath('a["c" + b]', ['a', '*"c" + b'])
  })

  it('handle invalid paths', function () {
    assertInvalidPath('.')
    assertInvalidPath(' . ')
    assertInvalidPath('..')
    assertInvalidPath('a[4')
    assertInvalidPath('a.b.')
    assertInvalidPath('a,b')
    assertInvalidPath('a["foo]')
    assertInvalidPath('[0foo]')
    assertInvalidPath('foo-bar')
    assertInvalidPath('42')
    assertInvalidPath('  42   ')
    assertInvalidPath('foo["bar]')
    assertInvalidPath("foo['bar]")
    assertInvalidPath('a]')
  })

  it('caching', function () {
    var path1 = Path.parsePath('a.b.c')
    var path2 = Path.parsePath('a.b.c')
    expect(path1).toBe(path2)
  })

  it('get', function () {
    var path = 'a[\'b"b"c\'][0]'
    var obj = {
      a: {
        'b"b"c': [12345]
      }
    }
    expect(Path.getPath(obj, path)).toBe(12345)
    expect(Path.getPath(obj, 'a.c')).toBeUndefined()
  })

  it('get dynamic', function () {
    var path = 'a[b]'
    var obj = {
      a: {
        key: 123
      },
      b: 'key'
    }
    expect(Path.getPath(obj, path)).toBe(123)
  })

  it('set', function () {
    var path = 'a.b.c'
    var obj = {
      a: {
        b: {
          c: null
        }
      }
    }
    var res = Path.setPath(obj, path, 12345)
    expect(res).toBe(true)
    expect(obj.a.b.c).toBe(12345)
  })

  it('set non-existent', function () {
    var target = {}
    var res = Path.setPath(target, 'a.b.c', 123)
    expect(res).toBe(true)
    expect(target.a.b.c).toBe(123)
  })

  it('set dynamic non-existent', function () {
    var target = {
      key: 'what',
      obj: {}
    }
    var res = Path.setPath(target, 'obj[key]', 123)
    expect(res).toBe(true)
    expect(target.obj.what).toBe(123)
    // sub expressions
    res = Path.setPath(target, 'obj["yo" + key]', 234)
    expect(res).toBe(true)
    expect(target.obj.yowhat).toBe(234)
  })

  it('set on prototype chain', function () {
    var parent = { a: {} }
    var target = Object.create(parent)
    var res = Path.setPath(target, 'a.b.c', 123)
    expect(res).toBe(true)
    expect(_.hasOwn(target, 'a')).toBe(false)
    expect(parent.a.b.c).toBe(123)
  })

  it('set array', function () {
    var target = {
      a: []
    }
    target.a.$set = jasmine.createSpy('Array.$set')
    var res = Path.setPath(target, 'a[1]', 123)
    expect(res).toBe(true)
    expect(target.a.$set).toHaveBeenCalledWith('1', 123)
  })

  it('set invalid', function () {
    var res = Path.setPath({}, 'ab[c]d', 123)
    expect(res).toBe(false)
  })
})
