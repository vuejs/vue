var _ = require('src/util')
var def = require('src/directives/internal/class')

describe(':class', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('plain string', function () {
    el.className = 'foo'
    var dir = _.extend({ el: el }, def)
    dir.update('bar')
    expect(el.className).toBe('foo bar')
    dir.update('baz qux')
    expect(el.className).toBe('foo baz qux')
    dir.update('qux')
    expect(el.className).toBe('foo qux')
    dir.update()
    expect(el.className).toBe('foo')
  })

  it('object value', function () {
    el.className = 'foo'
    var dir = _.extend({ el: el }, def)
    dir.update({
      bar: true,
      baz: false
    })
    expect(el.className).toBe('foo bar')
    dir.update({
      baz: true
    })
    expect(el.className).toBe('foo baz')
    dir.update(null)
    expect(el.className).toBe('foo')

    dir.update({
      'bar baz': true,
      qux: false
    })
    expect(el.className).toBe('foo bar baz')
    dir.update({
      qux: true
    })
    expect(el.className).toBe('foo qux')
  })

  it('array value', function () {
    el.className = 'a'
    var dir = _.extend({ el: el }, def)
    dir.update(['b', 'c'])
    expect(el.className).toBe('a b c')
    dir.update(['d', 'c'])
    expect(el.className).toBe('a c d')
    dir.update(['w', 'x y z'])
    expect(el.className).toBe('a w x y z')
    dir.update()
    expect(el.className).toBe('a')
    // test mutating array
    var arr = ['e', '']
    dir.update(arr)
    expect(el.className).toBe('a e')
    arr.length = 0
    arr.push('f')
    dir.update(arr)
    expect(el.className).toBe('a f')
    // test array with objects
    dir.update(['x', { y: true, z: true }])
    expect(el.className).toBe('a x y z')
    dir.update(['x', { y: true, z: false }])
    expect(el.className).toBe('a x y')
    dir.update(['f', { z: true }])
    expect(el.className).toBe('a f z')
    dir.update(['l', 'f', { n: true, z: true }])
    expect(el.className).toBe('a f z l n')
    dir.update(['x', {}])
    expect(el.className).toBe('a x')
    dir.update()
    expect(el.className).toBe('a')
  })
})
