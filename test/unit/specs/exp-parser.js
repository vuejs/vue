describe('Expression Parser', function () {

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
        },
        {
            // expressions with inline object literals
            exp: "sortRows({ column: 'name', test: 'haha', durrr: 123 })",
            vm: {
                sortRows: function (params) {
                    return params.column + params.durrr
                }
            },
            expectedValue: 'name123'
        }
    ]

    testCases.forEach(describeCase)

    describe('XSS protection', function () {
        
        var cases = [
            {
                xss: true,
                exp: "constructor.constructor('alert(1)')()",
                vm: {}
            },
            {
                xss: true,
                exp: "\"\".toString.constructor.constructor('alert(1)')()",
                vm: {}
            },
            {
                xss: true,
                exp: "\"\".toString['cons' + 'tructor']['cons' + 'tructor']('alert(1)')()",
                vm: {}
            },
            {
                xss: true,
                exp: "\"\".toString['\\u0063ons' + 'tructor']['\\u0063ons' + 'tructor']('alert(1)')()",
                vm: {}
            }
        ]

        cases.forEach(describeCase)

    })

    describe('scope trace', function () {
        
        it('should determine the correct scope for variables', function () {

            var bindingsCreated = {}

            var getter = ExpParser.parse('a + b', mockCompiler({
                parent: {
                    bindings: {},
                    createBinding: function (key) {
                        assert.strictEqual(key, 'a')
                        bindingsCreated[key] = true
                    },
                    hasKey: function (key) {
                        return key === 'a'
                    },
                    parent: {
                        bindings: {},
                        createBinding: function (key) {
                            assert.strictEqual(key, 'b')
                            bindingsCreated[key] = true
                        },
                        hasKey: function (key) {
                            return key === 'b'
                        }
                    }
                }
            }))
            var getterString = getter.toString()
            assert.ok(getterString.indexOf('this.$parent.a') > -1)
            assert.ok(getterString.indexOf('this.$parent.$parent.b') > -1)
        })

    })

    // extra case for invalid expressions
    describe('invalid expression', function () {

        before(warnSpy.swapWarn)

        it('should capture the error and warn', function () {
            ExpParser.parse('a + "fsef', mockCompiler())
            assert.ok(warnSpy.warned)
        })

        after(warnSpy.resetWarn)

    })

    describe('.eval() with extra data', function () {
        
        it('should be able to eval an epxression with temporary additional data', function () {
            var res = ExpParser.eval('a + b', mockCompiler(), { a: 1, b: 2 })
            assert.strictEqual(res, 3)
        })

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
                    vm: testCase.vm
                },
                vars = testCase.paths || Object.keys(testCase.vm),
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

                it('getter function should return expected value', function () {
                    var value = getter.call(testCase.vm)
                    assert.strictEqual(value, testCase.expectedValue)
                })

            } else {

                it('should return undefined getter', function () {
                    assert.strictEqual(getter, undefined)
                })

                it('should have warned', function () {
                    assert.ok(warnSpy.warned)
                })

            }

        })
    }

    function noop () {}

    function mockCompiler (opts) {
        var mock = {
            createBinding: noop,
            hasKey: noop,
            vm: {
                $compiler: {
                    bindings: {},
                    createBinding: noop
                },
                $data: {}
            }
        }
        for (var key in opts) {
            mock[key] = opts[key]
        }
        return mock
    }

})