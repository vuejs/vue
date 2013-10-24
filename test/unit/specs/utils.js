var utils = require('seed/src/utils')

describe('UNIT: Utils', function () {
    
    describe('hash', function () {

        it('should return an Object with null prototype', function () {
            var hash = utils.hash()
            assert.strictEqual(Object.getPrototypeOf(hash), null)
        })

    })

    describe('defProtected', function () {
        
        it('should define a protected property', function () {
            var a = {}
            utils.defProtected(a, 'test', 1)

            var count = 0
            for (var key in a) {
                count++
            }
            assert.strictEqual(count, 0, 'inenumerable')
            assert.strictEqual(JSON.stringify(a), '{}', 'unstringifiable')

            a.test = 2
            assert.strictEqual(a.test, 1, 'unconfigurable')
        })

        it('should take enumerable option', function () {
            var a = {}
            utils.defProtected(a, 'test', 1, true)

            var count = 0
            for (var key in a) {
                count++
            }
            assert.strictEqual(count, 1, 'enumerable')
            assert.strictEqual(JSON.stringify(a), '{"test":1}', 'stringifiable')
        })

    })

    describe('typeOf', function () {
        
        it('should return correct type', function () {
            var tof = utils.typeOf
            assert.equal(tof({}), 'Object')
            assert.equal(tof([]), 'Array')
            assert.equal(tof(1), 'Number')
            assert.equal(tof(''), 'String')
            assert.equal(tof(true), 'Boolean')
            assert.equal(tof(null), 'Null')
            assert.equal(tof(undefined), 'Undefined')
        })

    })

    describe('toText', function () {

        var txt = utils.toText

        it('should do nothing for strings and numbers', function () {
            assert.strictEqual(txt('hihi'), 'hihi')
            assert.strictEqual(txt(123), 123)
        })
        
        it('should output empty string if value is not string or number', function () {
            assert.strictEqual(txt({}), '')
            assert.strictEqual(txt([]), '')
            assert.strictEqual(txt(false), '')
            assert.strictEqual(txt(true), '')
            assert.strictEqual(txt(undefined), '')
            assert.strictEqual(txt(null), '')
            assert.strictEqual(txt(NaN), '')
        })

    })

    describe('extend', function () {
        
        it('should extend the obj with extension obj', function () {
            var a = {a: 1}, b = {a: {}, b: 2}
            utils.extend(a, b)
            assert.strictEqual(a.a, b.a)
            assert.strictEqual(a.b, b.b)
        })

        it('should respect the protective option', function () {
            var a = {a: 1}, b = {a: {}, b: 2}
            utils.extend(a, b, true)
            assert.strictEqual(a.a, 1)
            assert.strictEqual(a.b, b.b)
        })

    })

})