var Observer = require('../../src/observer'),
    assert = require('assert'),
    Emitter = require('events').EventEmitter

describe('UNIT: Observer', function () {
    
    describe('Observing Object', function () {
        
        it('should attach hidden observer and values to the object', function () {
            var obj = {}, ob = new Emitter()
            ob.proxies = {}
            Observer.observe(obj, 'test', ob)
            assert.ok(obj.__observer__ instanceof Emitter)
            assert.ok(obj.__values__)
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
        // body...
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