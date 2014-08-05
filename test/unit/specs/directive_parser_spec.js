var parse = require('../../../src/parse/directive').parse

describe('Directive Parser', function () {

  it('exp', function () {
    var res = parse('exp')
    expect(res.length).toBe(1)
    expect(res[0].expression).toBe('exp')
    expect(res[0].raw).toBe('exp')
  })

  it('arg:exp', function () {
    var res = parse('arg:exp')
    expect(res.length).toBe(1)
    expect(res[0].expression).toBe('exp')
    expect(res[0].arg).toBe('arg')
    expect(res[0].raw).toBe('arg:exp')
  })

  // filters
  it('arg : exp | abc de | bcd', function () {
    var res = parse(' arg : exp | abc de | bcd')
    expect(res.length).toBe(1)
    expect(res[0].expression).toBe('exp')
    expect(res[0].arg).toBe('arg')
    expect(res[0].raw).toBe('arg : exp | abc de | bcd')
    expect(res[0].filters.length).toBe(2)
    expect(res[0].filters[0].name).toBe('abc')
    expect(res[0].filters[0].args.length).toBe(1)
    expect(res[0].filters[0].args[0]).toBe('de')
    expect(res[0].filters[1].name).toBe('bcd')
    expect(res[0].filters[1].args).toBeNull()
  })

  // double pipe
  it('a || b | c', function () {
    var res = parse('a || b | c')
    expect(res.length).toBe(1)
    expect(res[0].expression).toBe('a || b')
    expect(res[0].raw).toBe('a || b | c')
    expect(res[0].filters.length).toBe(1)
    expect(res[0].filters[0].name).toBe('c')
    expect(res[0].filters[0].args).toBeNull()
  })

  // single quote + boolean
  it('a ? \'b\' : c', function () {
    var res = parse('a ? \'b\' : c')
    expect(res.length).toBe(1)
    expect(res[0].expression).toBe('a ? \'b\' : c')
    expect(res[0].filters).toBeUndefined()
  })

  // double quote + boolean
  it('"a:b:c||d|e|f" || d ? a : b', function () {
    var res = parse('"a:b:c||d|e|f" || d ? a : b')
    expect(res.length).toBe(1)
    expect(res[0].expression).toBe('"a:b:c||d|e|f" || d ? a : b')
    expect(res[0].filters).toBeUndefined()
    expect(res[0].arg).toBeUndefined()
  })

  // multiple simple clause
  it('a, b, c', function () {
    var res = parse('a, b, c')
    expect(res.length).toBe(3)
    expect(res[0].expression).toBe('a')
    expect(res[1].expression).toBe('b')
    expect(res[2].expression).toBe('c')
  })

  // multiple complex clause
  it('a:b | c | j, d:e | f | k l, g:h | i', function () {
    var res = parse('a:b | c | j, d:e | f | k l, g:h | i')
    expect(res.length).toBe(3)

    expect(res[0].arg).toBe('a')
    expect(res[0].expression).toBe('b')
    expect(res[0].filters.length).toBe(2)
    expect(res[0].filters[0].name).toBe('c')
    expect(res[0].filters[0].args).toBeNull()
    expect(res[0].filters[1].name).toBe('j')
    expect(res[0].filters[1].args).toBeNull()

    expect(res[1].arg).toBe('d')
    expect(res[1].expression).toBe('e')
    expect(res[1].filters.length).toBe(2)
    expect(res[1].filters[0].name).toBe('f')
    expect(res[1].filters[0].args).toBeNull()
    expect(res[1].filters[1].name).toBe('k')
    expect(res[1].filters[1].args.length).toBe(1)
    expect(res[1].filters[1].args[0]).toBe('l')

    expect(res[2].arg).toBe('g')
    expect(res[2].expression).toBe('h')
    expect(res[2].filters.length).toBe(1)
    expect(res[2].filters[0].name).toBe('i')
    expect(res[2].filters[0].args).toBeNull()
  })

  // super complex
  it('click:test(c.indexOf(d,f),"e,f"), input: d || [e,f], ok:{a:1,b:2}', function () {
    var res = parse('click:test(c.indexOf(d,f),"e,f"), input: d || [e,f], ok:{a:1,b:2}')
    expect(res.length).toBe(3)
    expect(res[0].arg).toBe('click')
    expect(res[0].expression).toBe('test(c.indexOf(d,f),"e,f")')
    expect(res[1].arg).toBe('input')
    expect(res[1].expression).toBe('d || [e,f]')
    expect(res[1].filters).toBeUndefined()
    expect(res[2].arg).toBe('ok')
    expect(res[2].expression).toBe('{a:1,b:2}')
  })

  it('cache', function () {
    var res1 = parse('a || b | c')
    var res2 = parse('a || b | c')
    expect(res1).toBe(res2)
  })

})