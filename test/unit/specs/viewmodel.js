/*
 *  Only tests the following:
 *  - .$get()
 *  - .$set()
 *  - .$watch()
 *  - .$unwatch()
 */

describe('UNIT: ViewModel', function () {

    mock('vm-test', '{{a.b.c}}')
    var data = {
            b: {
                c: 12345
            }
        },
        arr = [1, 2, 3],
        vm = new Seed({
            el: '#vm-test',
            scope: {
                a: data,
                b: arr
            }
        })
    
    describe('.$get()', function () {
        it('should retrieve correct value', function () {
            assert.strictEqual(vm.$get('a.b.c'), data.b.c)
        })
    })

    describe('.$set()', function () {
        vm.$set('a.b.c', 54321)
        it('should set correct value', function () {
            assert.strictEqual(data.b.c, 54321)
        })
    })

    describe('.$watch()', function () {

        it('should trigger callback when a plain value changes', function () {
            var val
            vm.$watch('a.b.c', function (newVal) {
                val = newVal
            })
            data.b.c = 'new value!'
            assert.strictEqual(val, data.b.c)
        })

        it('should trigger callback when an object value changes', function () {
            var val, subVal, rootVal,
                target = { c: 'hohoho' }
            vm.$watch('a.b', function (newVal) {
                val = newVal
            })
            vm.$watch('a.b.c', function (newVal) {
                subVal = newVal
            })
            vm.$watch('a', function (newVal) {
                rootVal = newVal
            })
            data.b = target
            assert.strictEqual(val, target)
            assert.strictEqual(subVal, target.c)
            vm.a = 'hehehe'
            assert.strictEqual(rootVal, 'hehehe')
        })

        it('should trigger callback when an array mutates', function () {
            var val, mut
            vm.$watch('b', function (array, mutation) {
                val = array
                mut = mutation
            })
            arr.push(4)
            assert.strictEqual(val, arr)
            assert.strictEqual(mut.method, 'push')
            assert.strictEqual(mut.args.length, 1)
            assert.strictEqual(mut.args[0], 4)
        })

    })

    describe('.$unwatch()', function () {
        
        it('should unwatch the stuff', function () {
            var triggered = false
            vm.$watch('a.b.c', function () {
                triggered = true
            })
            vm.$watch('a', function () {
                triggered = true
            })
            vm.$watch('b', function () {
                triggered = true
            })
            vm.$unwatch('a')
            vm.$unwatch('b')
            vm.$unwatch('a.b.c')
            vm.a = { b: { c:123123 }}
            vm.b.push(5)
            assert.notOk(triggered)
        })

    })

    describe('.$on', function () {
        
        it('should register listener on vm\'s compiler\'s emitter', function () {
            var t = new Seed(),
                triggered = false,
                msg = 'on test'
            t.$on('test', function (m) {
                assert.strictEqual(m, msg)
                triggered = true
            })
            t.$compiler.emitter.emit('test', msg)
            assert.ok(triggered)
        })

    })

    describe('.$once', function () {
        
        it('should invoke the listener only once', function () {
            var t = new Seed(),
                triggered = 0,
                msg = 'on once'
            t.$once('test', function (m) {
                assert.strictEqual(m, msg)
                triggered++
            })
            t.$compiler.emitter.emit('test', msg)
            t.$compiler.emitter.emit('test', msg)
            assert.strictEqual(triggered, 1)
        })

    })

    describe('$off', function () {
        
        it('should turn off the listener', function () {
            var t = new Seed(),
                triggered1 = false,
                triggered2 = false,
                f1 = function () {
                    triggered1 = true
                },
                f2 = function () {
                    triggered2 = true
                }
            t.$on('test', f1)
            t.$on('test', f2)
            t.$off('test', f1)
            t.$compiler.emitter.emit('test')
            assert.notOk(triggered1)
            assert.ok(triggered2)
        })

    })

    describe('.$broadcast()', function () {
        
        it('should notify all child VMs', function () {
            var triggered = 0,
                msg = 'broadcast test'
            var Child = Seed.extend({
                init: function () {
                    this.$on('hello', function (m) {
                        assert.strictEqual(m, msg)
                        triggered++
                    })
                }
            })
            var Test = Seed.extend({
                template: '<div sd-viewmodel="test"></div><div sd-viewmodel="test"></div>',
                vms: {
                    test: Child
                }
            })
            var t = new Test()
            t.$broadcast('hello', msg)
            assert.strictEqual(triggered, 2)
        })

    })

    describe('.$emit', function () {
        
        it('should notify all ancestor VMs', function (done) {
            var topTriggered = false,
                midTriggered = false,
                msg = 'emit test'
            var Bottom = Seed.extend({
                init: function () {
                    var self = this
                    setTimeout(function () {
                        self.$emit('hello', msg)
                        assert.ok(topTriggered)
                        assert.ok(midTriggered)
                        done()
                    }, 0)
                }
            })
            var Middle = Seed.extend({
                template: '<div sd-viewmodel="bottom"></div>',
                vms: { bottom: Bottom },
                init: function () {
                    this.$on('hello', function (m) {
                        assert.strictEqual(m, msg)
                        midTriggered = true
                    })
                }
            })
            var Top = Seed.extend({
                template: '<div sd-viewmodel="middle"></div>',
                vms: { middle: Middle },
                init: function () {
                    this.$on('hello', function (m) {
                        assert.strictEqual(m, msg)
                        topTriggered = true
                    })
                }
            })
            new Top()
        })

    })

})