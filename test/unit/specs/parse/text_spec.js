var textParser = require('../../../../src/parse/text')
var config = require('../../../../src/config')

var testCases = [
  {
    // no tags
    text: 'haha',
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
      { tag: true, value: 'html', html: true, oneTime: false },
    ]
  },
  {
    // one time
    text: '{{* text }} and {{{* html }}}',
    expected: [
      { tag: true, value: 'text', html: false, oneTime: true },
      { value: ' and ' },
      { tag: true, value: 'html', html: true, oneTime: true },
    ]
  },
  {
    // partial
    text: '{{> hello }} and {{>hello}}',
    expected: [
      { tag: true, value: 'hello', html: false, oneTime: false, partial: true },
      { value: ' and ' },
      { tag: true, value: 'hello', html: false, oneTime: false, partial: true }
    ]
  }
]

function assertParse (test) {
  var res = textParser.parse(test.text)
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
    var res1 = textParser.parse('{{a}}')
    var res2 = textParser.parse('{{a}}')
    expect(res1).toBe(res2)
  })

  it('custom delimiters', function () {
    config.delimiters = ['[%', '%]']
    assertParse({
      text: '[%* text %] and [[% html %]]',
      expected: [
        { tag: true, value: 'text', html: false, oneTime: true },
        { value: ' and ' },
        { tag: true, value: 'html', html: true, oneTime: false },
      ]
    })
  })

})