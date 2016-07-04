var Cache = require('src/cache')

/**
 * Debug function to assert cache state
 *
 * @param {Cache} cache
 */

function toString (cache) {
  var s = ''
  var entry = cache.head
  while (entry) {
    s += String(entry.key) + ':' + entry.value
    entry = entry.newer
    if (entry) {
      s += ' < '
    }
  }
  return s
}

describe('Cache', function () {
  var c = new Cache(4)

  it('put', function () {
    c.put('adam', 29)
    c.put('john', 26)
    c.put('angela', 24)
    c.put('bob', 48)
    expect(c.size).toBe(4)
    expect(toString(c)).toBe('adam:29 < john:26 < angela:24 < bob:48')
  })

  it('put with same key', function () {
    var same = new Cache(4)
    same.put('john', 29)
    same.put('john', 26)
    same.put('john', 24)
    same.put('john', 48)
    expect(same.size).toBe(1)
    expect(toString(same)).toBe('john:48')
  })

  it('get', function () {
    expect(c.get('adam')).toBe(29)
    expect(c.get('john')).toBe(26)
    expect(c.get('angela')).toBe(24)
    expect(c.get('bob')).toBe(48)
    expect(toString(c)).toBe('adam:29 < john:26 < angela:24 < bob:48')

    expect(c.get('angela')).toBe(24)
    // angela should now be the tail
    expect(toString(c)).toBe('adam:29 < john:26 < bob:48 < angela:24')
  })

  it('expire', function () {
    c.put('ygwie', 81)
    expect(c.size).toBe(4)
    expect(toString(c)).toBe('john:26 < bob:48 < angela:24 < ygwie:81')
    expect(c.get('adam')).toBeUndefined()
  })

  it('shift', function () {
    var shift = new Cache(4)
    shift.put('adam', 29)
    shift.put('john', 26)
    shift.put('angela', 24)
    shift.put('bob', 48)

    shift.shift()
    shift.shift()
    shift.shift()
    expect(shift.size).toBe(1)
    expect(toString(shift)).toBe('bob:48')
  })
})
