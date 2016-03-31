var _ = require('src/util')
var def = require('src/directives/internal/class')

describe(':class', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('plain string', function () {
    el.className = 'haha'
    var dir = _.extend({ el: el }, def)
    dir.update('test')
    expect(el.className).toBe('haha test')
    dir.update('what now test')
    expect(el.className).toBe('haha what now test')
    dir.update('ok cool')
    expect(el.className).toBe('haha ok cool')
    dir.update()
    expect(el.className).toBe('haha')
  })

  it('object value', function () {
    el.className = 'hoho'
    var dir = _.extend({ el: el }, def)
    dir.update({
      a: true,
      b: false
    })
    expect(el.className).toBe('hoho a')
    dir.update({
      b: true
    })
    expect(el.className).toBe('hoho b')
    dir.update(null)
    expect(el.className).toBe('hoho')

    dir.update({
      'a b': true,
      c: false
    })
    expect(el.className).toBe('hoho a b')
    dir.update({
      c: true
    })
    expect(el.className).toBe('hoho c')
  })

  it('array value', function () {
    el.className = 'a'
    var dir = _.extend({ el: el }, def)
    dir.update(['b', 'c'])
    expect(el.className).toBe('a b c')
    dir.update(['d', 'c'])
    expect(el.className).toBe('a d c')
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
    dir.update(['x', {y: true, z: true}])
    expect(el.className).toBe('a x y z')
    dir.update(['x', {y: true, z: false}])
    expect(el.className).toBe('a x y')
    dir.update(['f', {z: true}])
    expect(el.className).toBe('a f z')
    dir.update(['l', 'f', {n: true, z: true}])
    expect(el.className).toBe('a l f n z')
    dir.update(['x', {}])
    expect(el.className).toBe('a x')
    dir.update()
    expect(el.className).toBe('a')
  })
})
