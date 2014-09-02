var expParser = require('../../../../src/parse/expression')
var _ = require('../../../../src/util')

var testCases = [
  {
    // simple path that doesn't exist
    exp: 'a.b.c',
    scope: {
      a: {}
    },
    expected: undefined,
    paths: ['a']
  },
  {
    // simple path that exists
    exp: 'a.b.d',
    scope: {
      a:{b:{d:123}}
    },
    expected: 123,
    paths: ['a']
  },
  // complex path
  {
    exp: 'a["b"].c',
    scope: {
      a:{b:{c:234}}
    },
    expected: 234,
    paths: ['a']
  },
  {
    // string concat
    exp: 'a+b',
    scope: {
      a: 'hello',
      b: 'world'
    },
    expected: 'helloworld',
    paths: ['a', 'b']
  },
  {
    // math
    exp: 'a - b * 2 + 45',
    scope: {
      a: 100,
      b: 23
    },
    expected: 100 - 23 * 2 + 45,
    paths: ['a', 'b']
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
    expected: 'worked',
    paths: ['a', 'b', 'c', 'd', 'e']
  },
  {
    // inline string with newline
    exp: "a + 'hel\nlo'",
    scope: {
      a: 'inline '
    },
    expected: 'inline hel\nlo',
    paths: ['a']
  },
  {
    // dollar signs and underscore
    exp: "_a + ' ' + $b",
    scope: {
      _a: 'underscore',
      $b: 'dollar'
    },
    expected: 'underscore dollar',
    paths: ['_a', '$b']
  },
  {
    // complex with nested values
    exp: "todo.title + ' : ' + (todo['done'] ? 'yep' : 'nope')",
    scope: {
      todo: {
        title: 'write tests',
        done: false
      }
    },
    expected: 'write tests : nope',
    paths: ['todo']
  },
  {
    // expression with no data variables
    exp: "'a' + 'b'",
    scope: {},
    expected: 'ab',
    paths: []
  },
  {
    // values with same variable name inside strings
    exp: "'\"test\"' + test + \"'hi'\" + hi",
    scope: {
      test: 1,
      hi: 2
    },
    expected: '"test"1\'hi\'2',
    paths: ['test', 'hi']
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
    expected: 'namehoho123',
    paths: ['sortRows', 'haha']
  },
  {
    // space between path segments
    exp: '  a    .   b    .  c + d',
    scope: {
      a: { b: { c: 12 }},
      d: 3
    },
    expected: 15,
    paths: ['a', 'd']
  },
  {
    // space in bracket identifiers
    exp: ' a[ " a.b.c " ] + b  [ \' e \' ]',
    scope: {
      a: {' a.b.c ': 123},
      b: {' e ': 234}
    },
    expected: 357,
    paths: ['a', 'b']
  },
  {
    // number literal
    exp: 'a * 1e2 + 1.1',
    scope: {
      a: 3
    },
    expected: 301.1,
    paths: ['a']
  },
  {
    //keyowrd + keyword literal
    exp: 'true && a.true',
    scope: {
      a: { 'true': false }
    },
    expected: false,
    paths: ['a']
  },
  {
    // super complex
    exp: ' $a + b[ "  a.b.c  " ][\'123\'].$e&&c[ " d " ].e + Math.round(e) ',
    scope: {
      $a: 1,
      b: {
        '  a.b.c  ': {
          '123': { $e: 2 }
        }
      },
      c: { ' d ': {e: 3}},
      e: 4.5
    },
    expected: 8,
    paths: ['$a', 'b', 'c', 'e']
  }
]

describe('Expression Parser', function () {
  
  it('parse getter', function () {
    testCases.forEach(function assertExp (testCase) {
      var res = expParser.parse(testCase.exp, true)
      expect(res.get(testCase.scope)).toEqual(testCase.expected)
    })
  })

  it('dynamic setter', function () {
    // make sure checkSetter works:
    // should add setter if a cache hit doesn't have hit function.
    expParser.parse('a[b]')
    var res = expParser.parse('a[b]', true)
    var scope = {
      a: { c: 1 },
      b: 'c'
    }
    res.set(scope, 2)
    expect(scope.a.c).toBe(2)
  })

  it('simple path setter', function () {
    var res = expParser.parse('a.b.c', true)
    var scope = {}
    expect(function () {
      res.set(scope, 123)
    }).not.toThrow()
    scope.a = {b:{c:0}}
    res.set(scope, 123)
    expect(scope.a.b.c).toBe(123)
  })

  it('cache', function () {
    var res1 = expParser.parse('a + b')
    var res2 = expParser.parse('a + b')
    expect(res1).toBe(res2)
  })

  describe('invalid expression', function () {
    
    beforeEach(function () {
      spyOn(_, 'warn')
    })

    it('should warn on invalid expression', function () {
      var res = expParser.parse('a--b"ffff')
      expect(_.warn).toHaveBeenCalled()
    })

    if (leftHandThrows()) {
      it('should warn on invalid left hand expression for setter', function () {
        var res = expParser.parse('a+b', true)
        expect(_.warn).toHaveBeenCalled()
      })
    }
  })
})

/**
 * check if creating a new Function with invalid left-hand
 * assignment would throw
 */

function leftHandThrows () {
  try {
    var fn = new Function('a + b = 1')
  } catch (e) {
    return true
  }
}