var seed = require('seed')

describe('UNIT: API', function () {

    describe('ViewModel.extend()', function () {
        
        it('should return a subclass of seed.ViewModel', function () {
            var Test = seed.ViewModel.extend({})
            assert.ok(Test.prototype instanceof seed.ViewModel)
        })

        it('should mixin options.props', function () {
            var props = {
                a: 1,
                b: 2,
                c: function () {}
            }
            var Test = seed.ViewModel.extend({ props: props })
            for (var key in props) {
                assert.strictEqual(Test.prototype[key], props[key])
            }
        })

        it('should register VM in utils if options.id exists', function () {
            var Test = seed.ViewModel.extend({
                    id: 'test',
                    data: {
                        test: 'I have a viewmodel!'
                    },
                    props: {
                        hello: function () {
                            return 'hello'
                        }
                    }
                }),
                utils = require('seed/src/utils')
            assert.strictEqual(utils.getVM('test'), Test)
        })

        it('should call options.init when instantiating', function () {
            var called = false,
                Test = seed.ViewModel.extend({ init: function () {
                    called = true                           
                }}),
                test = new Test({ el: document.createElement('div') })
            assert.ok(called)
        })

    })

    describe('compile()', function () {

        it('should directly compile if arg is a node', function () {
            var testId = 'compile-1'
            mock(testId, '{{test}}')
            var vm = seed.compile('#' + testId, { data: { test: testId } })
            assert.ok(vm instanceof seed.ViewModel)
            assert.strictEqual($('#' + testId), testId)
        })

        it('should use correct VM constructor if sd-viewmodel is present', function () {
            var testId = 'compile-2'
            mock(testId, '{{test}}', {
                'sd-viewmodel': 'test' // see register VM test above
            })
            var vm = seed.compile('#' + testId)
            assert.ok(vm instanceof seed.ViewModel)
            assert.strictEqual(vm.hello(), 'hello', 'should inherit options.props')
            assert.strictEqual($('#' + testId), 'I have a viewmodel!', 'should inherit options.data')
        })

    })

    describe('config()', function () {
        
        it('should work when changing prefix', function () {
            var testId = 'config-1'
            seed.config({
                prefix: 'test'
            })
            mock(testId, '<span test-text="test"></span>')
            seed.compile('#' + testId, { data: { test: testId }})
            assert.strictEqual($('#' + testId + ' span'), testId)
        })

        it('should work when changing interpolate tags', function () {
            var testId = 'config-2'
            seed.config({
                interpolateTags: {
                    open: '<%',
                    close: '%>'
                }
            })
            mock(testId, '<% test %>')
            seed.compile('#' + testId, { data: { test: testId }})
            assert.strictEqual($('#' + testId), testId)
        })

        after(function () {
            seed.config({
                prefix: 'sd',
                interpolateTags: {
                    open: '{{',
                    close: '}}'
                }
            })
        })

    })

    describe('filter()', function () {

        var reverse = function (input) {
            return input.split('').reverse().join('')
        }
        
        it('should create custom filter', function () {
            var testId = 'filter-1',
                msg = '12345'
            seed.filter('reverse', reverse)
            mock(testId, '{{ test | reverse }}')
            seed.compile('#' + testId, { data: { test: msg }})
            assert.strictEqual($('#' + testId), '54321')
        })

        it('should return filter function if only one arg is given', function () {
            var f = seed.filter('reverse')
            assert.strictEqual(f, reverse)
        })

    })

    describe('directive()', function () {

        var dirTest
        
        it('should create custom directive with set function only', function () {
            var testId = 'directive-1',
                msg = 'wowow'
            seed.directive('test', function (value) {
                this.el.setAttribute(testId, value + '123')
            })
            mock(testId, '<span sd-test="test"></span>')
            seed.compile('#' + testId, { data: { test: msg }})
            var el = document.querySelector('#' + testId + ' span')
            assert.strictEqual(el.getAttribute(testId), msg + '123')
        })

        it('should create custom directive with object', function () {
            var testId = 'directive-2',
                msg = 'wowaaaa?'
            dirTest = {
                bind: function (value) {
                    this.el.setAttribute(testId + 'bind', msg + 'bind')
                },
                update: function (value) {
                    this.el.setAttribute(testId + 'update', msg + 'update')
                },
                unbind: function () {
                    this.el.removeAttribute(testId + 'bind')
                }
            }
            seed.directive('test2', dirTest)
            mock(testId, '<span sd-test2="test"></span>')
            var vm = seed.compile('#' + testId, { data: { test: msg }}),
                el = document.querySelector('#' + testId + ' span')
            assert.strictEqual(el.getAttribute(testId + 'bind'), msg + 'bind', 'should have called bind()')
            assert.strictEqual(el.getAttribute(testId + 'update'), msg + 'update', 'should have called update()')
            vm.$destroy() // assuming this works
            assert.notOk(el.getAttribute(testId + 'bind'), 'should have called unbind()')
        })

        it('should return directive object/fn if only one arg is given', function () {
            var dir = seed.directive('test2')
            assert.strictEqual(dir, dirTest)
        })

    })

})