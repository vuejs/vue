describe('Binding', function () {

    var Binding = require('vue/src/binding'),
        nextTick = require('vue/src/utils').nextTick

    describe('instantiation', function () {

        it('should have root==true with a root key', function () {
            var b = new Binding(null, 'test')
            assert.ok(b.root)
        })

        it('should have root==false with a non-root key', function () {
            var b = new Binding(null, 'test.key')
            assert.ok(!b.root)
        })

        it('should have root==false if its key is an expression', function () {
            var b = new Binding(null, 'test', true)
            assert.ok(!b.root)
        })

        it('should have dirs, subs and deps as Arrays', function () {
            var b = new Binding(null, 'test')
            assert.ok(Array.isArray(b.dirs), 'dirs')
            assert.ok(Array.isArray(b.subs), 'subs')
            assert.ok(Array.isArray(b.deps), 'deps')
        })

    })

    describe('.update()', function () {

        var b = new Binding(null, 'test'),
            val = 123,
            updated = 0,
            pubbed = false,
            numInstances = 3,
            instance = {
                $update: function (value) {
                    updated += value
                }
            }
        for (var i = 0; i < numInstances; i++) {
            b.dirs.push(instance)
        }
        b.pub = function () {
            pubbed = true
        }

        before(function (done) {
            b.update(val)
            nextTick(function () {
                done()
            })
        })

        it('should set the binding\'s value', function () {
            assert.strictEqual(b.value, val)
        })

        it('should update the binding\'s directives', function () {
            assert.strictEqual(updated, val * numInstances)
        })

        it('should call the binding\'s pub() method', function () {
            assert.ok(pubbed)
        })

        it('should not set the value if it is computed unless a function', function () {
            var b1 = new Binding(null, 'test'),
                b2 = new Binding(null, 'test', false, true)
            b1.isComputed = true
            b2.isComputed = true
            var ov = { $get: function () {} }
            b1.value = ov
            b2.value = function () {}
            b1.update(1)
            b2.update(1)
            assert.strictEqual(b1.value, ov)
            assert.strictEqual(b2.value, 1)
        })

    })

    describe('.val()', function () {
        
        it('should return the raw value for non-computed and function bindings', function () {
            var b1 = new Binding(null, 'test'),
                b2 = new Binding(null, 'test', false, true)
            b2.isComputed = true
            b1.value = 1
            b2.value = 2
            assert.strictEqual(b1.val(), 1)
            assert.strictEqual(b2.val(), 2)
        })

        it('should return computed value for computed bindings', function () {
            var b = new Binding(null, 'test')
            b.isComputed = true
            b.value = {
                $get: function () {
                    return 3
                }
            }
            assert.strictEqual(b.val(), 3)
        })

    })

    describe('.pub()', function () {
        
        var b = new Binding(null, 'test'),
            refreshed = 0,
            numSubs = 3,
            sub = {
                update: function () {
                    refreshed++
                }
            }
        for (var i = 0; i < numSubs; i++) {
            b.subs.push(sub)
        }
        b.pub()

        it('should call update() of all subscribers', function () {
            assert.strictEqual(refreshed, numSubs)
        })

    })

    describe('.unbind()', function () {
        
        var b = new Binding(null, 'test'),
            unbound = 0,
            numInstances = 3,
            instance = {
                $unbind: function () {
                    unbound++
                }
            }
        for (var i = 0; i < numInstances; i++) {
            b.dirs.push(instance)
        }

        // mock deps
        var dep1 = { subs: [1, 2, 3, b] },
            dep2 = { subs: [2, b, 4, 6] }
        b.deps.push(dep1, dep2)

        b.unbind()

        it('should call unbind() of all directives', function () {
            assert.strictEqual(unbound, numInstances)
        })

        it('should remove itself from the subs list of all its dependencies', function () {
            var notInSubs1 = dep1.subs.indexOf(b) === -1,
                notInSubs2 = dep2.subs.indexOf(b) === -1
            assert.ok(notInSubs1)
            assert.ok(notInSubs2)
        })

    })

})