// shiv the document to provide dummy object
global.document = {
    createElement: function () { return {} }
}

var DepsParser = require('../../src/deps-parser'),
    assert     = require('assert')

describe('UNIT: Dependency Parser', function () {
    it('should work', function () {
        assert.ok(true)
    })
})