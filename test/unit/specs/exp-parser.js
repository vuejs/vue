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
                getter = ExpParser.parse(testCase.exp, compilerMock),
                vm     = testCase.vm,
                vars   = testCase.paths || Object.keys(vm)

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
            assert.ok(warned)
            utils.warn = oldWarn
        })

    })

})