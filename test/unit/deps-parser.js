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
    
    describe('.createDummyVM()', function () {
        var createDummyVM = DepsParser.cdvm
    })

    describe('.parseContextDependency()', function () {
        var parseContextDependency = DepsParser.pcd
    })

})