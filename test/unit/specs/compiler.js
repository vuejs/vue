// Only methods with no side effects are tested here

describe('Compiler', function () {
    
    describe('.eval()', function () {

        var v = new Vue({
            data: {
                b: 1,
                c: {
                    d: 2
                }
            }
        })

        it('should eval correct value', function () {
            var res = v.$compiler.eval('a {{b}} {{b + c.d}} c')
            assert.strictEqual(res, 'a 1 3 c')
        })

        it('should accept additional data', function () {
            var res = v.$compiler.eval('{{c.d}}', { c: { d: 3 } })
            assert.strictEqual(res, 3)
            res = v.$compiler.eval('{{c.d === 3 ? "a" : "b"}}', { c: { d: 3 } })
            assert.strictEqual(res, 'a')
        })

    })

})