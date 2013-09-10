/*
 *  Only tests the following:
 *  - .$get()
 *  - .$set()
 *  - .$watch()
 *  - .$unwatch()
 */

 var seed = require('seed')

describe('UNIT: ViewModel', function () {

    mock('vm-test', '{{a.b.c}}')
    var data = {
            b: {
                c: 12345
            }
        },
        arr = [1, 2, 3],
        vm = seed.compile('#vm-test', {
            data: {
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
            vm.$watch('a.b.c', function (newVal) {
                triggered = true
            })
            vm.$watch('a', function (newVal) {
                triggered = true
            })
            vm.$watch('b', function (newVal) {
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

})