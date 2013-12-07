describe('UNIT: Filters', function () {

    var filters = require('vue/src/filters')
    
    describe('capitalize', function () {

        var filter = filters.capitalize

        it('should capitalize a string', function () {
            var res = filter('fsefsfsef')
            assert.strictEqual(res.charAt(0), 'F')
            assert.strictEqual(res.slice(1), 'sefsfsef')
        })

        assertNumberAndFalsy(filter)

    })

    describe('uppercase', function () {

        var filter = filters.uppercase
        
        it('should uppercase a string', function () {
            var res = filter('fsefef')
            assert.strictEqual(res, 'FSEFEF')
        })

        assertNumberAndFalsy(filter)

    })

    describe('lowercase', function () {
        
        var filter = filters.lowercase

        it('should lowercase a string', function () {
            var res = filter('AweSoMe')
            assert.strictEqual(res, 'awesome')
        })

        assertNumberAndFalsy(filter)

    })

    describe('pluralize', function () {
        
        var filter = filters.pluralize

        it('should simply add "s" if arg length is 1', function () {
            var args = ['item'],
                res0 = filter(0, args),
                res1 = filter(1, args),
                res2 = filter(2, args)
            assert.strictEqual(res0, 'items')
            assert.strictEqual(res1, 'item')
            assert.strictEqual(res2, 'items')
        })

        it('should use corresponding format when arg length is greater than 1', function () {
            var args = ['st', 'nd', 'rd'],
                res0 = filter(0, args),
                res1 = filter(1, args),
                res2 = filter(2, args),
                res3 = filter(3, args)
            assert.strictEqual(res0, 'rd')
            assert.strictEqual(res1, 'st')
            assert.strictEqual(res2, 'nd')
            assert.strictEqual(res3, 'rd')
        })

    })

    describe('currency', function () {
        
        var filter = filters.currency

        it('should format a number correctly', function () {
            var res1 = filter(1234),
                res2 = filter(1234.45),
                res3 = filter(123443434.4343434)
            assert.strictEqual(res1, '$1,234.00')
            assert.strictEqual(res2, '$1,234.45')
            assert.strictEqual(res3, '$123,443,434.43')
        })

        it('should use the arg for the currency sign', function () {
            var res = filter(2134, '@')
            assert.strictEqual(res, '@2,134.00')
        })

        it('should return empty string on falsy values except 0', function () {
            var res1 = filter(false),
                res2 = filter(null),
                res3 = filter(undefined),
                res4 = filter(0)
            assert.strictEqual(res1, '')
            assert.strictEqual(res2, '')
            assert.strictEqual(res3, '')
            assert.strictEqual(res4, '$0.00')
        })

    })

    describe('key', function () {

        var filter = filters.key

        it('should return a function that only triggers when key matches', function () {
            var args = ['enter'],
                triggered = false,
                handler = filter(function () {
                    triggered = true
                }, args)
            handler({ keyCode: 0 })
            assert.notOk(triggered)
            handler({ keyCode: 13 })
            assert.ok(triggered)
        })

        it('should also work for direct keyCode', function () {
            var args = [13],
                triggered = false,
                handler = filter(function () {
                    triggered = true
                }, args)
            handler({ keyCode: 0 })
            assert.notOk(triggered)
            handler({ keyCode: 13 })
            assert.ok(triggered)
        })

    })

})

function assertNumberAndFalsy (filter) {
    it('should return a stringified number', function () {
        var res = filter(12345)
        assert.strictEqual(res, '12345')
    })

    it('should return empty string on falsy values except 0', function () {
        var res1 = filter(false),
            res2 = filter(null),
            res3 = filter(undefined),
            res4 = filter(0)
        assert.strictEqual(res1, '')
        assert.strictEqual(res2, '')
        assert.strictEqual(res3, '')
        assert.strictEqual(res4, '0')
    })
}