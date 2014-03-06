describe('Compiler', function () {
    
    describe('.eval()', function () {

        it('should eval correct value', function () {
            var v = new Vue({
                data: {
                    b: 1,
                    c: {
                        d: 2
                    }
                }
            })
            assert.strictEqual(v.$compiler.eval('a {{b}} {{b + c.d}} c'), 'a 1 3 c')
        })

    })

})