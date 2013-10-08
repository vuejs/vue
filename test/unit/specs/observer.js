var Observer = require('seed/src/observer'),
    Emitter = require('emitter')

describe('UNIT: Observer', function () {
    
    describe('Observing Object', function () {
        
        it('should attach hidden observer and values to the object', function () {
            var obj = {}, ob = new Emitter()
            ob.proxies = {}
            Observer.observe(obj, 'test', ob)
            assert.ok(obj.__observer__ instanceof Emitter)
            assert.ok(obj.__observer__.values)
        })

        it('should emit set events with correct path', setTestFactory({
            obj: { a: 1, b: { c: 2 } },
            expects: [
                { key: 'test.a', val: 1 },
                { key: 'test.b.c', val: 3 }
            ],
            path: 'test'
        }))

        it('should emit multiple events when a nested object is set', setTestFactory({
            obj: { a: 1, b: { c: 2 } },
            expects: [
                { key: 'test.b', val: { c: 3 } },
                { key: 'test.b.c', val: 3, skip: true }
            ],
            path: 'test'
        }))

        it('should emit get events on tip values', getTestFactory({
            obj: { a: 1, b: { c: 2 } },
            expects: [
                'test.a',
                'test.b.c'
            ],
            path: 'test'
        }))

        it('should emit set when first observing', function () {
            var obj = { a: 1, b: { c: 2} },
                ob = new Emitter(), i = 0
            ob.proxies = {}
            var expects = [
                { key: 'test.a', val: obj.a },
                { key: 'test.b', val: obj.b },
                { key: 'test.b.c', val: obj.b.c }
            ]
            ob.on('set', function (key, val) {
                var exp = expects[i]
                assert.strictEqual(key, exp.key)
                assert.strictEqual(val, exp.val)
                i++
            })
            Observer.observe(obj, 'test', ob)
            assert.strictEqual(i, expects.length)
        })

        it('should emit set when watching an already observed object', function () {
            var obj = { a: 1, b: { c: 2} },
                ob1 = new Emitter(),
                ob2 = new Emitter(),
                i = 0
            ob1.proxies = {}
            ob2.proxies = {}
            Observer.observe(obj, 'test', ob1) // watch first time

            var expects = [
                { key: 'test.a', val: obj.a },
                { key: 'test.b', val: obj.b },
                { key: 'test.b.c', val: obj.b.c }
            ]
            ob2.on('set', function (key, val) {
                var exp = expects[i]
                assert.strictEqual(key, exp.key)
                assert.strictEqual(val, exp.val)
                i++
            })
            Observer.observe(obj, 'test', ob2) // watch again
            assert.strictEqual(i, expects.length)
        })

    })

    describe('Observing Array', function () {

        var arr = [],
            ob = new Emitter()
        ob.proxies = {}
        Observer.observe(arr, 'test', ob)
        
        it('should attach the hidden observer', function () {
            assert.ok(arr.__observer__ instanceof Emitter)
        })

        it('should overwrite the native array mutator methods', function () {
            ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
                assert.notStrictEqual(arr[method], Array.prototype[method])
            })
        })

        it('should emit set for .length when it mutates', function () {
            var emitted = false
            ob.once('set', function (key, val) {
                assert.strictEqual(key, 'test.length')
                assert.strictEqual(val, 1)
                emitted = true
            })
            arr.push(1)
            assert.ok(emitted)
        })

        describe('Mutator Methods', function () {
            
            it('push', function () {
                var arg1 = 123,
                    arg2 = 234,
                    emitted = false
                ob.once('mutate', function (key, array, mutation) {
                    assert.strictEqual(key, 'test')
                    assert.strictEqual(array, arr)
                    assert.strictEqual(array.length, 3)
                    assert.strictEqual(mutation.method, 'push')
                    assert.strictEqual(mutation.args.length, 2)
                    assert.strictEqual(mutation.args[0], arg1)
                    assert.strictEqual(mutation.args[1], arg2)
                    assert.strictEqual(mutation.result, arr.length)
                    emitted = true
                })
                var r = arr.push(arg1, arg2)
                assert.ok(emitted)
                assert.strictEqual(r, arr.length)
            })

            it('pop', function () {
                var emitted = false,
                    expected = arr[arr.length - 1]
                ob.once('mutate', function (key, array, mutation) {
                    assert.strictEqual(key, 'test')
                    assert.strictEqual(array, arr)
                    assert.strictEqual(array.length, 2)
                    assert.strictEqual(mutation.method, 'pop')
                    assert.strictEqual(mutation.args.length, 0)
                    assert.strictEqual(mutation.result, expected)
                    emitted = true
                })
                var r = arr.pop()
                assert.ok(emitted)
                assert.strictEqual(r, expected)
            })

            it('shift', function () {
                var emitted = false,
                    expected = arr[0]
                ob.once('mutate', function (key, array, mutation) {
                    assert.strictEqual(key, 'test')
                    assert.strictEqual(array, arr)
                    assert.strictEqual(array.length, 1)
                    assert.strictEqual(mutation.method, 'shift')
                    assert.strictEqual(mutation.args.length, 0)
                    assert.strictEqual(mutation.result, expected)
                    emitted = true
                })
                var r = arr.shift()
                assert.ok(emitted)
                assert.strictEqual(r, expected)
            })

            it('unshift', function () {
                var emitted = false,
                    arg1 = 456,
                    arg2 = 678
                ob.once('mutate', function (key, array, mutation) {
                    assert.strictEqual(key, 'test')
                    assert.strictEqual(array, arr)
                    assert.strictEqual(array.length, 3)
                    assert.strictEqual(mutation.method, 'unshift')
                    assert.strictEqual(mutation.args.length, 2)
                    assert.strictEqual(mutation.args[0], arg1)
                    assert.strictEqual(mutation.args[1], arg2)
                    assert.strictEqual(mutation.result, arr.length)
                    emitted = true
                })
                var r = arr.unshift(arg1, arg2)
                assert.ok(emitted)
                assert.strictEqual(r, arr.length)
            })

            it('splice', function () {
                var emitted = false,
                    arg1 = 789,
                    arg2 = 910,
                    expected = arr[1]
                ob.once('mutate', function (key, array, mutation) {
                    assert.strictEqual(key, 'test')
                    assert.strictEqual(array, arr)
                    assert.strictEqual(array.length, 4)
                    assert.strictEqual(mutation.method, 'splice')
                    assert.strictEqual(mutation.args.length, 4)
                    assert.strictEqual(mutation.args[0], 1)
                    assert.strictEqual(mutation.args[1], 1)
                    assert.strictEqual(mutation.args[2], arg1)
                    assert.strictEqual(mutation.args[3], arg2)
                    assert.strictEqual(mutation.result.length, 1)
                    assert.strictEqual(mutation.result[0], expected)
                    emitted = true
                })
                var r = arr.splice(1, 1, arg1, arg2)
                assert.ok(emitted)
                assert.strictEqual(r.length, 1)
                assert.strictEqual(r[0], expected)
            })

            it('sort', function () {
                var emitted = false,
                    sorter = function (a, b) {
                        return a > b ? -1 : 1
                    },
                    copy = arr.slice().sort(sorter)
                ob.once('mutate', function (key, array, mutation) {
                    assert.strictEqual(key, 'test')
                    assert.strictEqual(array, arr)
                    assert.strictEqual(mutation.method, 'sort')
                    assert.strictEqual(mutation.args.length, 1)
                    assert.strictEqual(mutation.result, arr)
                    for (var i = 0; i < copy.length; i++) {
                        assert.strictEqual(array[i], copy[i])
                    }
                    emitted = true
                })
                var r = arr.sort(sorter)
                assert.ok(emitted)
                assert.strictEqual(r, arr)
            })

            it('reverse', function () {
                var emitted = false,
                    copy = arr.slice().reverse()
                ob.once('mutate', function (key, array, mutation) {
                    assert.strictEqual(key, 'test')
                    assert.strictEqual(array, arr)
                    assert.strictEqual(mutation.method, 'reverse')
                    assert.strictEqual(mutation.args.length, 0)
                    assert.strictEqual(mutation.result, arr)
                    for (var i = 0; i < copy.length; i++) {
                        assert.strictEqual(array[i], copy[i])
                    }
                    emitted = true
                })
                var r = arr.reverse()
                assert.ok(emitted)
                assert.strictEqual(r, arr)
            })

        })

        describe('Augmentations', function () {
            
            it('remove', function () {
                var emitted = false,
                    expected = arr[0] = { a: 1 }
                ob.once('mutate', function (key, array, mutation) {
                    emitted = true
                    assert.strictEqual(mutation.method, 'splice')
                    assert.strictEqual(mutation.args.length, 2)
                })
                var r = arr.remove(expected)
                assert.ok(emitted)
                assert.strictEqual(r, expected)
            })

            it('replace', function () {
                var emitted = false,
                    expected = arr[0] = { a: 1 },
                    arg = 45678
                ob.once('mutate', function (key, array, mutation) {
                    emitted = true
                    assert.strictEqual(mutation.method, 'splice')
                    assert.strictEqual(mutation.args.length, 3)
                })
                var r = arr.replace(expected, arg)
                assert.ok(emitted)
                assert.strictEqual(r, expected)
                assert.strictEqual(arr[0], arg)
            })

            it('mutateFilter', function () {
                var filter = function (e) {
                        return e > 1000
                    },
                    copy = arr.slice().filter(filter)
                arr.mutateFilter(filter)
                for (var i = 0; i < copy.length; i++) {
                    assert.strictEqual(arr[i], copy[i])
                }
            })

        })

    })

})

function setTestFactory (opts) {
    return function () {
        var ob = new Emitter(),
            i  = 0,
            obj = opts.obj,
            expects = opts.expects
        ob.proxies = {}
        Observer.observe(obj, opts.path, ob)
        ob.on('set', function (key, val) {
            var expect = expects[i]
            assert.strictEqual(key, expect.key)
            assert.strictEqual(val, expect.val)
            i++
        })
        expects.forEach(function (expect) {
            if (expect.skip) return
            var path = expect.key.split('.'),
                j = 1,
                scope = obj
            while (j < path.length - 1) {
                scope = scope[path[j]]
                j++
            }
            scope[path[j]] = expect.val
        })
        assert.strictEqual(i, expects.length)
    }
}

function getTestFactory (opts) {
    return function () {
        var ob = new Emitter(),
            i  = 0,
            obj = opts.obj,
            expects = opts.expects
        ob.proxies = {}
        Observer.observe(obj, opts.path, ob)
        ob.on('get', function (key) {
            var expected = expects[i]
            assert.strictEqual(key, expected)
            i++
        })
        expects.forEach(function (key) {
            var path = key.split('.'),
                j = 1,
                scope = obj
            while (j < path.length) {
                scope = scope[path[j]]
                j++
            }
        })
        assert.strictEqual(i, expects.length)
    }
}