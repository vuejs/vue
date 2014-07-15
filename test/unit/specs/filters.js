describe('Filters', function () {

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
            var arg = 'item',
                res0 = filter(0, arg),
                res1 = filter(1, arg),
                res2 = filter(2, arg)
            assert.strictEqual(res0, 'items')
            assert.strictEqual(res1, 'item')
            assert.strictEqual(res2, 'items')
        })

        it('should use corresponding format when arg length is greater than 1', function () {
            var res0 = filter(0, 'st', 'nd', 'rd'),
                res1 = filter(1, 'st', 'nd', 'rd'),
                res2 = filter(2, 'st', 'nd', 'rd'),
                res3 = filter(3, 'st', 'nd', 'rd')
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

        it('should cast strings into float', function () {
            var res1 = filter('fesf'),
                res2 = filter('0.24')
            assert.strictEqual(res1, '')
            assert.strictEqual(res2, '$0.24')
        })

    })

    describe('key', function () {

        var filter = filters.key

        it('should return a function that only triggers when key matches', function () {
            var triggered = false,
                handler = filter(function () {
                    triggered = true
                }, 'enter')
            handler({ keyCode: 0 })
            assert.notOk(triggered)
            handler({ keyCode: 13 })
            assert.ok(triggered)
        })

        it('should also work for direct keyCode', function () {
            var triggered = false,
                handler = filter(function () {
                    triggered = true
                }, 13)
            handler({ keyCode: 0 })
            assert.notOk(triggered)
            handler({ keyCode: 13 })
            assert.ok(triggered)
        })

    })

    describe('filterBy', function () {
        
        var filter = filters.filterBy,
            arr = [
                { a: 1, b: { c: 'hello' }},
                { a: 1, b: 'hello'},
                { a: 1, b: 2 }
            ],
            vm = new Vue({
                data: {
                    search: { key: 'hello', datakey: 'b.c' }
                }
            })

        it('should be computed', function () {
            assert.ok(filter.computed)
        })

        it('should recursively check for searchKey if no dataKey is provided', function () {
            var res = filter.call(vm, arr, 'search.key')
            assert.strictEqual(res.length, 2)
            assert.deepEqual(res, arr.slice(0, 2))
        })

        it('should check for datakey only if provided', function () {
            var res = filter.call(vm, arr, 'search.key', 'search.datakey')
            assert.strictEqual(res.length, 1)
            assert.strictEqual(res[0], arr[0])
        })

        it('should use literal searchKey if in single quotes', function () {
            var res = filter.call(vm, arr, "'hello'", "'b.c'")
            assert.strictEqual(res.length, 1)
            assert.strictEqual(res[0], arr[0])
        })

        it('should accept optional delimiter', function () {
            var res = filter.call(vm, arr, 'search.key', 'in', 'search.datakey')
            assert.strictEqual(res.length, 1)
            assert.strictEqual(res[0], arr[0])
        })

        it('should work with objects', function () {
            var obj = {
                a: arr[0],
                b: arr[1],
                c: arr[2]
            }
            var res = filter.call(vm, obj, "'a'", "'$key'")
            assert.strictEqual(res.length, 1)
            assert.strictEqual(res[0], arr[0])
        })

    })

    describe('orderBy', function () {

        var filter = filters.orderBy,
            arr = [
                { a: { b: 0 }, c: 'b'},
                { a: { b: 2 }, c: 'c'},
                { a: { b: 1 }, c: 'a'}
            ]
        
        it('should be computed', function () {
            assert.ok(filter.computed)
        })

        it('should sort based on sortKey', function () {
            var vm = new Vue({
                data: { sortby: 'a.b' }
            })
            var res = filter.call(vm, arr, 'sortby')
            assert.strictEqual(res[0].a.b, 0)
            assert.strictEqual(res[1].a.b, 1)
            assert.strictEqual(res[2].a.b, 2)
        })

        it('should sort based on sortKey and reverseKey', function () {
            var vm = new Vue({
                data: { sortby: 'a.b', reverse: true }
            })
            var res = filter.call(vm, arr, 'sortby', 'reverse')
            assert.strictEqual(res[0].a.b, 2)
            assert.strictEqual(res[1].a.b, 1)
            assert.strictEqual(res[2].a.b, 0)
        })

        it('should sort with literal args and special -1 syntax', function () {
            var res = filter.call(new Vue(), arr, "'c'", '-1')
            assert.strictEqual(res[0].c, 'c')
            assert.strictEqual(res[1].c, 'b')
            assert.strictEqual(res[2].c, 'a')
        })

        it('should accept negate reverse key', function () {
            var res = filter.call(new Vue({
                data: { reverse: true }
            }), arr, "'c'", '!reverse')
            assert.strictEqual(res[0].c, 'a')
            assert.strictEqual(res[1].c, 'b')
            assert.strictEqual(res[2].c, 'c')
        })

        it('should work with objects', function () {
            var obj = {
                a: arr[0],
                b: arr[1],
                c: arr[2]
            }
            var res = filter.call(new Vue(), obj, "'$key'", '-1')
            assert.strictEqual(res[0].c, 'a')
            assert.strictEqual(res[1].c, 'c')
            assert.strictEqual(res[2].c, 'b')
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