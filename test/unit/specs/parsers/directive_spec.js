var parse = require('src/parsers/directive').parseDirective

describe('Directive Parser', function () {
  it('simple', function () {
    var res = parse('exp')
    expect(res.expression).toBe('exp')
  })

  it('with filters', function () {
    var res = parse('exp | abc de \'ok\' \'\' 123 | bcd')
    expect(res.expression).toBe('exp')
    expect(res.filters.length).toBe(2)
    expect(res.filters[0].name).toBe('abc')
    expect(res.filters[0].args.length).toBe(4)
    expect(res.filters[0].args[0].value).toBe('de')
    expect(res.filters[0].args[0].dynamic).toBe(true)
    expect(res.filters[0].args[1].value).toBe('ok')
    expect(res.filters[0].args[1].dynamic).toBe(false)
    expect(res.filters[0].args[2].value).toBe('')
    expect(res.filters[0].args[2].dynamic).toBe(false)
    expect(res.filters[0].args[3].value).toBe(123)
    expect(res.filters[0].args[3].dynamic).toBe(false)
    expect(res.filters[1].name).toBe('bcd')
    expect(res.filters[1].args).toBeUndefined()
  })

  it('reserved filter args', function () {
    var res = parse('arr | filterBy a in b')
    expect(res.expression).toBe('arr')
    expect(res.filters.length).toBe(1)
    expect(res.filters[0].args.length).toBe(3)
    expect(res.filters[0].args[0].value).toBe('a')
    expect(res.filters[0].args[0].dynamic).toBe(true)
    expect(res.filters[0].args[1].value).toBe('in')
    expect(res.filters[0].args[1].dynamic).toBe(false)
    expect(res.filters[0].args[2].value).toBe('b')
    expect(res.filters[0].args[2].dynamic).toBe(true)
  })

  it('double pipe', function () {
    var res = parse('a || b | c')
    expect(res.expression).toBe('a || b')
    expect(res.filters.length).toBe(1)
    expect(res.filters[0].name).toBe('c')
    expect(res.filters[0].args).toBeUndefined()
  })

  it('single quote + boolean', function () {
    var res = parse('a ? \'b\' : c')
    expect(res.expression).toBe('a ? \'b\' : c')
    expect(res.filters).toBeUndefined()
  })

  it('double quote + boolean', function () {
    var res = parse('"a:b:c||d|e|f" || d ? a : b')
    expect(res.expression).toBe('"a:b:c||d|e|f" || d ? a : b')
    expect(res.filters).toBeUndefined()
    expect(res.arg).toBeUndefined()
  })

  it('nested function calls + array/object literals', function () {
    var res = parse('test(c.indexOf(d,f),"e,f")')
    expect(res.expression).toBe('test(c.indexOf(d,f),"e,f")')
  })

  it('array literal', function () {
    var res = parse('d || [e,f]')
    expect(res.expression).toBe('d || [e,f]')
    expect(res.filters).toBeUndefined()
  })

  it('object literal', function () {
    var res = parse('{a: 1, b: 2} | p')
    expect(res.expression).toBe('{a: 1, b: 2}')
    expect(res.filters.length).toBe(1)
    expect(res.filters[0].name).toBe('p')
    expect(res.filters[0].args).toBeUndefined()
  })

  it('escape string', function () {
    var res = parse("'a\\'b' | test")
    expect(res.expression).toBe("'a\\'b'")
    expect(res.filters.length).toBe(1)
    expect(res.filters[0].name).toBe('test')
    expect(res.filters[0].args).toBeUndefined()
  })

  it('cache', function () {
    var res1 = parse('a || b | c')
    var res2 = parse('a || b | c')
    expect(res1).toBe(res2)
  })
})
