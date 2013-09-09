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
            var Test = seed.ViewModel.extend({ id: 'test' }),
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

        it('should querySelector target node if arg is a string', function () {
            // body...
        })

        it('should directly compile if arg is a node', function () {
            // body...
        })

        it('should use correct VM constructor if sd-viewmodel is present', function () {
            // body...
        })

    })

    describe('config()', function () {
        
        it('should work when changing prefix', function () {
            // body...
        })

        it('should work when changing interpolate tags', function () {
            // body...
        })

    })

    describe('filter()', function () {
        
        it('should create custom filter', function () {
            // body...
        })

        it('should return filter function if only one arg is given', function () {
            // body...
        })

    })

    describe('directive()', function () {
        
        it('should create custom directive', function () {
            // body...
        })

        it('should return directive object/fn if only one arg is given', function () {
            // body...
        })

    })

})