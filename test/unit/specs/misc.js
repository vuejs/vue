describe('Misc Features', function () {

    var nextTick = require('vue/src/utils').nextTick
    
    describe('inline expression', function () {
        it('should evaluate the correct value', function (done) {
            var v = new Vue({
                template: '{{a + "123" + b}} and {{c}}'
            })
            v.a = 'A'
            v.b = 'B'
            v.c = 'C'
            nextTick(function () {
                assert.strictEqual(v.$el.textContent, 'A123B and C')
                done()
            })
        })
    })

    describe('computed properties', function () {
        it('should be accessible like a normal attribtue', function () {
            var b = 2
            var v = new Vue({
                data: {
                    a: 1,
                    test: {
                        $get: function () {
                            return this.a + b
                        },
                        $set: function (v) {
                            b = v - this.a
                        }
                    }
                }
            })

            assert.strictEqual(v.test, 3)
            v.a = 2
            assert.strictEqual(v.test, 4)
            b = 3
            assert.strictEqual(v.test, 5)
            v.test = 10
            assert.strictEqual(b, 8)
        })
    })

    describe('setting an object to empty', function () {
        it('should emit undefined for paths in the old object', function () {
            var v = new Vue({
                data: {
                    a: {
                        b: { c: 1 }
                    }
                }
            })
            var emitted = false
            v.$watch('a.b.c', function (v) {
                assert.strictEqual(v, undefined)
                emitted = true
            })
            v.a = {}
            assert.ok(emitted)
        })
    })

})