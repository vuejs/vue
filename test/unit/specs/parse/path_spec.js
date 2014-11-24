var Path = require('../../../../src/parsers/path')

function assertPath (str, expected) {
  var path = Path.parse(str)
  expect(pathMatch(path, expected)).toBe(true)
}

function assertInvalidPath (str) {
  var path = Path.parse(str)
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
  
  it('parse', function () {
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
    assertPath('foo["b\\"az"]', ['foo', 'b"az'])
    assertPath("foo['b\\'az']", ['foo', "b'az"])
  })

  it('handle invalid paths', function () {
    assertInvalidPath('.')
    assertInvalidPath(' . ')
    assertInvalidPath('..')
    assertInvalidPath('a[4')
    assertInvalidPath('a.b.')
    assertInvalidPath('a,b')
    assertInvalidPath('a["foo]')
    assertInvalidPath('[0x04]')
    assertInvalidPath('[0foo]')
    assertInvalidPath('[foo-bar]')
    assertInvalidPath('foo-bar')
    assertInvalidPath('42')
    assertInvalidPath('a[04]')
    assertInvalidPath(' a [ 04 ]')
    assertInvalidPath('  42   ')
    assertInvalidPath('foo["bar]')
    assertInvalidPath("foo['bar]")
  })

  it('caching', function () {
    var path1 = Path.parse('a.b.c')
    var path2 = Path.parse('a.b.c')
    expect(path1).toBe(path2)
  })

  it('get', function () {
    var path = 'a[\'b"b"c\'][0]'
    var obj = {
      a: {
        'b"b"c': [12345]
      }
    }
    expect(Path.get(obj, path)).toBe(12345)
    expect(Path.get(obj, 'a.c')).toBeUndefined()
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
    var res = Path.set(obj, path, 12345)
    expect(res).toBe(true)
    expect(obj.a.b.c).toBe(12345)
  })

  it('set non-existent', function () {
    var target = {}
    var res = Path.set(target, 'a.b.c', 123)
    expect(res).toBe(true)
    expect(target.a.b.c).toBe(123)
  })

  it('set on prototype chain', function () {
    var parent = { a: {} }
    var target = Object.create(parent)
    var res = Path.set(target, 'a.b.c', 123)
    expect(res).toBe(true)
    expect(target.hasOwnProperty('a')).toBe(false)
    expect(parent.a.b.c).toBe(123)
  })

  it('set invalid', function () {
    var res = Path.set({}, 'ab[c]d', 123)
    expect(res).toBe(false)
  })

})