var textParser = require('src/parsers/text')
var dirParser = require('src/parsers/directive')
var config = require('src/config')

var testCases = [
  {
    // no tags
    text: 'foo',
    expected: null
  },
  {
    // basic
    text: 'a {{ a }} c',
    expected: [
      { value: 'a ' },
      { tag: true, value: 'a', html: false, oneTime: false },
      { value: ' c' }
    ]
  },
  {
    // html
    text: '{{ text }} and {{{ html }}}',
    expected: [
      { tag: true, value: 'text', html: false, oneTime: false },
      { value: ' and ' },
      { tag: true, value: 'html', html: true, oneTime: false }
    ]
  },
  {
    // one time
    text: '{{* text }} and {{{* html }}}',
    expected: [
      { tag: true, value: 'text', html: false, oneTime: true },
      { value: ' and ' },
      { tag: true, value: 'html', html: true, oneTime: true }
    ]
  },
  {
    text: '[{{abc}}]',
    expected: [
      { value: '[' },
      { tag: true, value: 'abc', html: false, oneTime: false },
      { value: ']' }
    ]
  },
  // multiline
  {
    text: '{{\n  value  \n}}',
    expected: [
      { tag: true, value: 'value', html: false, oneTime: false }
    ]
  },
  // multiline HTML
  {
    text: '{{{\n code \n}}}',
    expected: [
      { tag: true, value: 'code', html: true, oneTime: false }
    ]
  },
  // new lines preserved outside of tags
  {
    text: 'hello\n{{value}}\nworld',
    expected: [
        { value: 'hello\n' },
        { tag: true, value: 'value', html: false, oneTime: false },
        { value: '\nworld' }
    ]
  }
]

function assertParse (test) {
  var res = textParser.parseText(test.text)
  var exp = test.expected
  if (!Array.isArray(exp)) {
    expect(res).toBe(exp)
  } else {
    expect(res.length).toBe(exp.length)
    res.forEach(function (r, i) {
      var e = exp[i]
      for (var key in e) {
        expect(e[key]).toEqual(r[key])
      }
    })
  }
}

describe('Text Parser', function () {
  it('parse', function () {
    testCases.forEach(assertParse)
  })

  it('cache', function () {
    var res1 = textParser.parseText('{{a}}')
    var res2 = textParser.parseText('{{a}}')
    expect(res1).toBe(res2)
  })

  it('custom delimiters', function () {
    config.delimiters = ['[%', '%]']
    config.unsafeDelimiters = ['{!!', '!!}']
    assertParse({
      text: '[%* text %] and {!! html !!}',
      expected: [
        { tag: true, value: 'text', html: false, oneTime: true },
        { value: ' and ' },
        { tag: true, value: 'html', html: true, oneTime: false }
      ]
    })
    config.delimiters = ['{{', '}}']
    config.unsafeDelimiters = ['{{{', '}}}']
  })

  it('tokens to expression', function () {
    var tokens = textParser.parseText('view-{{test + 1}}-test-{{ok + "|"}}')
    var exp = textParser.tokensToExp(tokens)
    expect(exp).toBe('"view-"+(test + 1)+"-test-"+(ok + "|")')
  })

  it('tokens to expression, single expression', function () {
    var tokens = textParser.parseText('{{test}}')
    var exp = textParser.tokensToExp(tokens)
    // should not have parens so it can be treated as a
    // simple path by the expression parser
    expect(exp).toBe('test')
  })

  it('tokens to expression with filters, multiple expressions', function () {
    var tokens = textParser.parseText('a {{b | c d | f}} e')
    var exp = textParser.tokensToExp(tokens)
    var filters = dirParser.parseDirective('b | c d | f').filters
    expect(exp).toBe(
      '"a "+this._applyFilters(b,null,' +
        JSON.stringify(filters) +
      ',false)+" e"')
  })
})
