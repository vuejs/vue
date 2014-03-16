describe('Observer', function () {

    var Observer = require('vue/src/observer'),
        Emitter  = require('vue/src/emitter')
    
    describe('Observing Object', function () {

        it('should not watch a ViewModel instance', function () {
            var obj = new Vue(), ob = new Emitter()
            Observer.observe(obj, 'test', ob)
            assert.notOk(obj.__emitter__)
        })
        
        it('should attach hidden observer and values to the object', function () {
            var obj = {}, ob = new Emitter()
            Observer.observe(obj, 'test', ob)
            assert.ok(obj.__emitter__ instanceof Emitter)
            assert.ok(obj.__emitter__.values)
        })

        var o1 = { a: 1, b: { c: 2 } }
        it('should emit set events with correct path', setTestFactory({
            obj: o1,
            expects: [
                { key: 'test.a', val: 1 },
                { key: 'test', val: o1, skip: true },
                { key: 'test.b.c', val: 3 },
                { key: 'test.b', val: o1.b, skip: true },
                { key: 'test', val: o1, skip: true }
            ],
            path: 'test'
        }))

        var o2 = { a: 1, b: { c: 2 } }
        it('should emit multiple events when a nested object is set', setTestFactory({
            obj: o2,
            expects: [
                { key: 'test.b', val: { c: 3 } },
                { key: 'test', val: o2, skip: true },
                { key: 'test.b.c', val: 3, skip: true }
            ],
            path: 'test'
        }))

        it('should emit get events', function () {
            Observer.shouldGet = true

            var ob = new Emitter(),
                i  = 0,
                obj = { a: 1, b: { c: 2 } },
                gets = [
                    'a',
                    'b.c'
                ],
                expects = [
                    'test.a',
                    'test.b',
                    'test.b.c'
                ]
            Observer.observe(obj, 'test', ob)
            ob.on('get', function (key) {
                var expected = expects[i]
                assert.strictEqual(key, expected)
                i++
            })
            gets.forEach(function (key) {
                var path = key.split('.'),
                    j = 0,
                    data = obj
                while (j < path.length) {
                    data = data[path[j]]
                    j++
                }
            })
            assert.strictEqual(i, expects.length)

            Observer.shouldGet = false
        })

        it('should emit set when first observing', function () {
            var obj = { a: 1, b: { c: 2} },
                ob = new Emitter(), i = 0
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
        Observer.observe(arr, 'test', ob)
        
        it('should attach the hidden observer', function () {
            assert.ok(arr.__emitter__ instanceof Emitter)
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

            it('$set', function () {
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
                var r = arr.$set(index, arg)
                assert.ok(emitted)
                assert.strictEqual(r, expected)
                assert.strictEqual(arr[index], arg)
            })

            it('$remove (index)', function () {
                var emitted = false,
                    index = ~~(Math.random() * arr.length),
                    expected = arr[index] = { a: 1 }
                ob.once('mutate', function (key, array, mutation) {
                    emitted = true
                    assert.strictEqual(mutation.method, 'splice')
                    assert.strictEqual(mutation.args.length, 2)
                    assert.strictEqual(mutation.args[0], index)
                })
                var r = arr.$remove(index)
                assert.ok(emitted)
                assert.strictEqual(r, expected)
            })
            
            it('$remove (object)', function () {
                var emitted = false,
                    index = ~~(Math.random() * arr.length),
                    expected = arr[index] = { a: 1 }
                ob.once('mutate', function (key, array, mutation) {
                    emitted = true
                    assert.strictEqual(mutation.method, 'splice')
                    assert.strictEqual(mutation.args.length, 2)
                    assert.strictEqual(mutation.args[0], index)
                })
                var r = arr.$remove(expected)
                assert.ok(emitted)
                assert.strictEqual(r, expected)
            })

        })

        describe('Link/Unlink', function () {
            
            var arr = [{a:1}]
            Observer.convert(arr)
            Observer.watch(arr)

            it('should emit empty set when inner objects change', function () {
                var emitted = false
                arr.__emitter__.on('set', function (key) {
                    assert.strictEqual(key, '')
                    emitted = true
                })
                arr[0].a = 2
                assert.ok(emitted)
                arr.__emitter__.off()
            })

            it('should emit for objects added later too', function () {
                var emitCount = 0,
                    a = {c:1}, b = {c:1}, c = {c:1}
                arr.__emitter__.on('set', function () {
                    emitCount++
                })
                arr.push(a)
                arr.unshift(b)
                arr.splice(0, 0, c)
                a.c = b.c = c.c = 2
                assert.strictEqual(emitCount, 3)
            })

            it('should remove itself from unlinked elements', function () {
                var removed = arr.pop(),
                    index = removed.__emitter__.owners.indexOf(arr)
                assert.strictEqual(index, -1)
            })

        })

    })

    describe('Multiple observers', function () {

        var ob1 = new Emitter(),
            ob2 = new Emitter(),
            obj = {a:1}
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
            var callbacks = obj.__emitter__._callbacks
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

    function setTestFactory (opts) {
        return function () {
            var ob = new Emitter(),
                i  = 0,
                obj = opts.obj,
                expects = opts.expects
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
                    data = obj
                while (j < path.length - 1) {
                    data = data[path[j]]
                    j++
                }
                data[path[j]] = expect.val
            })
            assert.strictEqual(i, expects.length)
        }
    }

})