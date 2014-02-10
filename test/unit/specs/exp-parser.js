describe('UNIT: Expression Parser', function () {

    var ExpParser = require('vue/src/exp-parser'),
        utils = require('vue/src/utils'),
        oldWarn = utils.warn

    var warnSpy = {
        warned: false,
        swapWarn: function () {
            utils.warn = function () {
                warnSpy.warned = true
            }
        },
        resetWarn: function () {
            utils.warn = oldWarn
            warnSpy.warned = false
        }
    }
    
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
            // expression with no data variables
            exp: "'a' + 'b'",
            vm: {},
            expectedValue: 'ab'
        },
        {
            // values with same variable name inside strings
            exp: "'\"test\"' + test + \"'hi'\" + hi",
            vm: {
                test: 1,
                hi: 2
            },
            expectedValue: '"test"1\'hi\'2'
        }
    ]

    testCases.forEach(describeCase)

    // extra case for invalid expressions
    describe('invalid expression', function () {

        before(warnSpy.swapWarn)
        
        it('should capture the error and warn', function () {
            function noop () {}
            ExpParser.parse('a + "fsef', {
                createBinding: noop,
                hasKey: noop,
                vm: {
                    $compiler: {
                        bindings: {},
                        createBinding: noop
                    },
                    $data: {}
                }
            })
            assert.ok(warnSpy.warned)
        })

        after(warnSpy.resetWarn)

    })

    describe('XSS protection', function () {
        
        var cases = [
            {
                xss: true,
                exp: "constructor.constructor('alert(1)')()",
                vm: {},
                expectedValue: undefined
            },
            {
                xss: true,
                exp: "\"\".toString.constructor.constructor('alert(1)')()",
                vm: {},
                expectedValue: undefined
            },
            {
                xss: true,
                exp: "\"\".toString['cons' + 'tructor']['cons' + 'tructor']('alert(1)')()",
                vm: {},
                expectedValue: undefined
            },
            {
                xss: true,
                exp: "\"\".toString['\\u0063ons' + 'tructor']['\\u0063ons' + 'tructor']('alert(1)')()",
                vm: {},
                expectedValue: undefined
            }
        ]

        cases.forEach(describeCase)

    })

    function describeCase (testCase) {
        describe(testCase.exp, function () {

            function createBinding (path) {
                caughtMissingPaths.push(path)
            }

            var caughtMissingPaths = [],
                compilerMock = {
                    createBinding: createBinding,
                    hasKey: function () {},
                    vm:{
                        $data: {},
                        $compiler:{
                            bindings:{},
                            createBinding: createBinding
                        }
                    }
                },
                vm     = testCase.vm,
                vars   = testCase.paths || Object.keys(vm),
                getter

            if (testCase.xss) {
                before(warnSpy.swapWarn)
                after(warnSpy.resetWarn)
            }

            before(function () {
                getter = ExpParser.parse(testCase.exp, compilerMock)
            })

            if (!testCase.xss) {
                it('should get correct paths', function () {
                    if (!vars.length) return
                    assert.strictEqual(caughtMissingPaths.length, vars.length)
                    for (var i = 0; i < vars.length; i++) {
                        assert.strictEqual(vars[i], caughtMissingPaths[i])
                    }
                })
            }

            it('getter function should return expected value', function () {
                var value = getter.call(vm)
                assert.strictEqual(value, testCase.expectedValue)
            })

            if (testCase.xss) {
                it('should have warned', function () {
                    assert.ok(warnSpy.warned)
                })
            }

        })
    }

})