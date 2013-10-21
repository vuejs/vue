var ExpParser = require('seed/src/exp-parser')

describe('UNIT: Expression Parser', function () {
    
    var testCases = [
        {
            // string concat
            exp: 'a + b',
            vm: {
                a: 'hello',
                b: 'world'
            },
            expectedValue: 'helloworld'
        },
        {
            // math
            exp: 'a - b * 2 + 45',
            vm: {
                a: 100,
                b: 23
            },
            expectedValue: 100 - 23 * 2 + 45
        },
        {
            // boolean logic
            exp: '(a && b) ? c : d || e',
            vm: {
                a: true,
                b: false,
                c: null,
                d: false,
                e: 'worked'
            },
            expectedValue: 'worked'
        },
        {
            // inline string
            exp: "a + 'hello'",
            vm: {
                a: 'inline '
            },
            expectedValue: 'inline hello'
        },
        {
            // complex with nested values
            exp: "todo.title + ' : ' + (todo.done ? 'yep' : 'nope')",
            paths: ['todo.title', 'todo.done'],
            vm: {
                todo: {
                    title: 'write tests',
                    done: false
                }
            },
            expectedValue: 'write tests : nope'
        }
    ]

    testCases.forEach(describeCase)

    function describeCase (testCase) {
        describe(testCase.exp, function () {

            var result = ExpParser.parse(testCase.exp),
                vm     = testCase.vm,
                vars   = testCase.paths || Object.keys(vm)

            // mock the $get().
            // the real $get() will be tested in integration tests.
            vm.$get = function (key) { return this[key] }

            it('should get correct args', function () {
                assert.strictEqual(result.paths.length, vars.length)
                for (var i = 0; i < vars.length; i++) {
                    assert.strictEqual(vars[i], result.paths[i])
                }
            })

            it('should generate correct getter function', function () {
                var value = result.getter.call(vm)
                assert.strictEqual(value, testCase.expectedValue)
            })

        })
    }

})