describe('UNIT: Observer', function () {

    var Observer = require('vue/src/observer'),
        Emitter  = require('emitter'),
        DepsOb   = require('vue/src/deps-parser').observer
    
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

        it('should emit get events on tip values', function () {
            DepsOb.active = true
            getTestFactory({
                obj: { a: 1, b: { c: 2 } },
                expects: [
                    'test.a',
                    'test.b.c'
                ],
                path: 'test'
            })()
            DepsOb.active = false
        })

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

            it('remove (index)', function () {
                var emitted = false,
                    index = ~~(Math.random() * arr.length),
                    expected = arr[index] = { a: 1 }
                ob.once('mutate', function (key, array, mutation) {
                    emitted = true
                    assert.strictEqual(mutation.method, 'splice')
                    assert.strictEqual(mutation.args.length, 2)
                    assert.strictEqual(mutation.args[0], index)
                })
                var r = arr.remove(index)
                assert.ok(emitted)
                assert.strictEqual(r, expected)
            })
            
            it('remove (object)', function () {
                var emitted = false,
                    index = ~~(Math.random() * arr.length),
                    expected = arr[index] = { a: 1 }
                ob.once('mutate', function (key, array, mutation) {
                    emitted = true
                    assert.strictEqual(mutation.method, 'splice')
                    assert.strictEqual(mutation.args.length, 2)
                    assert.strictEqual(mutation.args[0], index)
                })
                var r = arr.remove(expected)
                assert.ok(emitted)
                assert.strictEqual(r, expected)
            })

            it('remove (function)', function () {
                var expected = [1001, 1002]
                arr.push.apply(arr, expected)
                var filter = function (e) {
                        return e > 1000
                    },
                    copy = arr.filter(function (e) {
                        return e <= 1000
                    })
                var removed = arr.remove(filter)
                assert.deepEqual(arr, copy)
                assert.deepEqual(expected, removed)
            })

            it('replace (index)', function () {
                var emitted = false,
                    index = ~~(Math.random() * arr.length),
                    expected = arr[index] = { a: 1 },
                    arg = 34567
                ob.once('mutate', function (key, array, mutation) {
                    emitted = true
                    assert.strictEqual(mutation.method, 'splice')
                    assert.strictEqual(mutation.args.length, 3)
                    assert.strictEqual(mutation.args[0], index)
                })
                var r = arr.replace(index, arg)
                assert.ok(emitted)
                assert.strictEqual(r, expected)
                assert.strictEqual(arr[index], arg)
            })

            it('replace (object)', function () {
                var emitted = false,
                    index = ~~(Math.random() * arr.length),
                    expected = arr[index] = { a: 1 },
                    arg = 45678
                ob.once('mutate', function (key, array, mutation) {
                    emitted = true
                    assert.strictEqual(mutation.method, 'splice')
                    assert.strictEqual(mutation.args.length, 3)
                    assert.strictEqual(mutation.args[0], index)
                })
                var r = arr.replace(expected, arg)
                assert.ok(emitted)
                assert.strictEqual(r, expected)
                assert.strictEqual(arr[index], arg)
            })

            it('replace (function)', function () {
                arr[0] = 1
                arr[1] = 2
                arr[2] = 3
                var expected = [2, 3, 3],
                    expectRet = [1, 2]
                var replaced = arr.replace(function (e) {
                    if (e < 3) return e + 1
                })
                assert.deepEqual(arr, expected)
                assert.deepEqual(replaced, expectRet)
            })

        })

    })

    describe('Multiple observers', function () {

        var ob1 = new Emitter(),
            ob2 = new Emitter(),
            obj = {a:1}
        ob1.proxies = {}
        ob2.proxies = {}
        Observer.observe(obj, 'test', ob1)
        Observer.observe(obj, 'test', ob2)

        var ob1Called = false,
            ob2Called = false

        ob1.on('set', function () {
            ob1Called = true
        })
        ob2.on('set', function () {
            ob2Called = true
        })

        it('should trigger events for multiple observers observing the same object', function () {
            obj.a = 2
            assert.ok(ob1Called)
            assert.ok(ob2Called)
        })

    })

    describe('.unobserve()', function () {
        
        var ob1 = new Emitter(),
            ob2 = new Emitter(),
            obj = {a:1}
        ob1.proxies = {}
        ob2.proxies = {}
        Observer.observe(obj, 'test', ob1)
        Observer.observe(obj, 'test', ob2)
        Observer.unobserve(obj, 'test', ob1)

        var ob1Called = false
        ob1.on('set', function () {
            ob1Called = true
        })
        var ob2Called = false
        ob2.on('set', function () {
            ob2Called = true
        })

        it('should set observer proxies path to null', function () {
            assert.strictEqual(ob1.proxies['test.'], null)
        })

        it('should turn off corresponding event listeners', function () {
            var callbacks = obj.__observer__._callbacks
            for (var e in callbacks) {
                assert.strictEqual(callbacks[e].length, 1)
            }
        })

        it('should no longer emit events', function () {
            obj.a = 2
            assert.notOk(ob1Called)
            assert.ok(ob2Called)
        })

    })

    describe('.ensurePath()', function () {
        
        it('should ensure a path can be accessed without error', function () {
            var obj = {},
                path = 'a.b.c'
            Observer.ensurePath(obj, path)
            assert.strictEqual(obj.a.b.c, undefined)
        })

    })

    describe('.ensurePaths()', function () {
        
        it('should ensure path for all paths that start with the given key', function () {
            var key = 'a',
                obj = {},
                paths = {
                    'a.b.c': 1,
                    'a.d': 2,
                    'e.f': 3,
                    'g': 4
                }
            Observer.ensurePaths(key, obj, paths)
            assert.strictEqual(obj.b.c, undefined)
            assert.strictEqual(obj.d, undefined)
            assert.notOk('f' in obj)
            assert.strictEqual(Object.keys(obj).length, 2)
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

})