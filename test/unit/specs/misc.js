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

    describe('expression inside attributes', function () {
        it('should interpolate the attribute', function (done) {
            var v = new Vue({
                attributes: {
                    test: 'one {{msg}} three'
                },
                data: {
                    msg: 'two'
                }
            })
            assert.strictEqual(v.$el.getAttribute('test'), 'one two three')
            v.msg = '2'
            nextTick(function () {
                assert.strictEqual(v.$el.getAttribute('test'), 'one 2 three')
                done()
            })
        })
    })

    describe('triple mustache', function () {
        it('should set unescaped HTML', function () {
            var v = new Vue({
                template: '{{{html}}}',
                data: {
                    html: '<span>a</span><a>hi</a>'
                }
            })
            assert.strictEqual(v.$el.innerHTML, '<span>a</span><a>hi</a><!--v-html-->')
        })
    })

    describe('computed properties', function () {
        it('should be accessible like a normal attribtue', function () {
            var b = 2
            var v = new Vue({
                data: {
                    a: 1,
                },
                computed: {
                    test: {
                        $get: function () {
                            return this.a + b
                        },
                        $set: function (v) {
                            b = v - this.a
                        }
                    },
                    getOnly: function () {
                        return this.a + 1
                    }
                }
            })

            assert.strictEqual(v.test, 3)
            assert.strictEqual(v.getOnly, 2)
            v.a = 2
            assert.strictEqual(v.test, 4)
            assert.strictEqual(v.getOnly, 3)
            b = 3
            assert.strictEqual(v.test, 5)
            v.test = 10
            assert.strictEqual(b, 8)
        })
    })

    describe('setting an object to empty', function () {
        it('should emit undefined for paths in the old object', function (done) {
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
            nextTick(function () {
                assert.ok(emitted)
                done()
            })
        })
    })

})