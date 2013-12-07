describe('UNIT: Expression Parser', function () {

    var ExpParser = require('vue/src/exp-parser')
    
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
        },
        {
            // expression with no scope variables
            exp: "'a' + 'b'",
            vm: {},
            expectedValue: 'ab'
        }
    ]

    testCases.forEach(describeCase)

    function describeCase (testCase) {
        describe(testCase.exp, function () {

            var caughtMissingPaths = [],
                compilerMock = {
                    vm:{
                        $compiler:{
                            bindings:{},
                            createBinding: function (path) {
                                caughtMissingPaths.push(path)
                            }
                        }
                    }
                },
                getter = ExpParser.parse(testCase.exp, compilerMock),
                vm     = testCase.vm,
                vars   = testCase.paths || Object.keys(vm)

            // mock the $get().
            // the real $get() will be tested in integration tests.
            vm.$get = function (key) { return this[key] }

            it('should get correct paths', function () {
                if (!vars.length) return
                assert.strictEqual(caughtMissingPaths.length, vars.length)
                for (var i = 0; i < vars.length; i++) {
                    assert.strictEqual(vars[i], caughtMissingPaths[i])
                }
            })

            it('should generate correct getter function', function () {
                var value = getter.call(vm)
                assert.strictEqual(value, testCase.expectedValue)
            })

        })
    }

    // extra case for invalid expressions
    describe('invalid expression', function () {
        
        it('should capture the error and warn', function () {
            var utils = require('vue/src/utils'),
                oldWarn = utils.warn,
                warned = false
            utils.warn = function () {
                warned = true
            }
            ExpParser.parse('a + "fsef', {
                vm: {
                    $compiler: {
                        bindings: {},
                        createBinding: function () {}
                    }
                }
            })
            assert.ok(warned)
            utils.warn = oldWarn
        })

    })

})