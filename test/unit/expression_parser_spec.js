var expParser = require('../../src/parse/expression')

function assertExp (testCase) {
  var fn = expParser.parse(testCase.exp)
  expect(fn(testCase.scope)).toEqual(testCase.expected)
}

var testCases = [
  {
    // string concat
    exp: 'a+b',
    scope: {
      a: 'hello',
      b: 'world'
    },
    expected: 'helloworld'
  },
  {
    // math
    exp: 'a - b * 2 + 45',
    scope: {
      a: 100,
      b: 23
    },
    expected: 100 - 23 * 2 + 45
  },
  {
    // boolean logic
    exp: '(a && b) ? c : d || e',
    scope: {
      a: true,
      b: false,
      c: null,
      d: false,
      e: 'worked'
    },
    expected: 'worked'
  },
  {
    // inline string with newline
    exp: "a + 'hel\nlo'",
    scope: {
      a: 'inline '
    },
    expected: 'inline hel\nlo'
  },
  {
    // dollar signs and underscore
    exp: "_a + ' ' + $b",
    scope: {
      _a: 'underscore',
      $b: 'dollar'
    },
    expected: 'underscore dollar'
  },
  {
    // complex with nested values
    exp: "todo.title + ' : ' + (todo.done ? 'yep' : 'nope')",
    scope: {
      todo: {
        title: 'write tests',
        done: false
      }
    },
    expected: 'write tests : nope'
  },
  {
    // expression with no data variables
    exp: "'a' + 'b'",
    scope: {},
    expected: 'ab'
  },
  {
    // values with same variable name inside strings
    exp: "'\"test\"' + test + \"'hi'\" + hi",
    scope: {
      test: 1,
      hi: 2
    },
    expected: '"test"1\'hi\'2'
  },
  {
    // expressions with inline object literals
    exp: "sortRows({ column: 'name', test: haha, durrr: 123 })",
    scope: {
      sortRows: function (params) {
        return params.column + params.test + params.durrr
      },
      haha: 'hoho'
    },
    expected: 'namehoho123'
  }
]

describe('Expression Parser', function () {
  
  it('parse getter', function () {
    testCases.forEach(assertExp)
  })

  it('parse setter', function () {
    var setter = expParser.parse('a[b]', true).setter
    var scope = {
      a: { c: 1 },
      b: 'c'
    }
    setter(scope, 2)
    expect(scope.a.c).toBe(2)
  })

  it('cache', function () {
    var fn1 = expParser.parse('a + b')
    var fn2 = expParser.parse('a + b')
    expect(fn1).toBe(fn2)
  })

})