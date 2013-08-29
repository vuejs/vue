/*
 *  NOTE
 *
 *  this suite only tests two utility methods used in the
 *  Dependency Parser, but does not test the main .parse()
 *  method. .parse() is covered in integration tests because
 *  it has to work with multiple compilers.
 */

// shiv the document to provide dummy object
global.document = {
    createElement: function () { return {} }
}

var DepsParser = require('../../src/deps-parser'),
    assert     = require('assert')

describe('UNIT: Dependency Parser', function () {

    describe('.parseContextDependency()', function () {
    
        var binding = {
            rawGet: function (ctx) {
                return ctx.vm.a + ctx.vm.a + ctx.vm.b.c
            },
            compiler: {
                contextBindings: []
            }
        }
        DepsParser.pcd(binding)

        it('should not contain duplicate entries', function () {
            assert.strictEqual(binding.contextDeps.length, 2)
        })

        it('should extract correct context dependencies from a getter', function () {
            assert.strictEqual(binding.contextDeps[0], 'b.c')
            assert.strictEqual(binding.contextDeps[1], 'a')
        })

        it('should add the binding to its compiler\'s contextBindings', function () {
            assert.ok(binding.compiler.contextBindings.indexOf(binding) !== -1)
        })

    })

    describe('.createDummyVM()', function () {

        var createDummyVM = DepsParser.cdvm,
            binding = {
                contextDeps: ['a.b', 'a.b.c', 'b']
            }
        
        it('should create a dummy VM that has all context dep paths', function () {
            var vm = createDummyVM(binding)
            assert.ok('a' in vm)
            assert.ok('b' in vm)
            assert.ok('b' in vm.a)
            assert.ok('c' in vm.a.b)
        })

    })

})