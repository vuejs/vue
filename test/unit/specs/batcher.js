describe('Batcher', function () {

    var batcher = require('vue/src/batcher'),
        nextTick = require('vue/src/utils').nextTick

    var updateCount = 0
    function mockBinding (id, middleware) {
        return {
            id: id,
            _update: function () {
                updateCount++
                this.updated = true
                if (middleware) middleware()
            }
        }
    }
    
    it('should queue bindings to be updated on nextTick', function (done) {
        
        updateCount = 0
        var b1 = mockBinding(1),
            b2 = mockBinding(2)
        batcher.queue(b1)
        batcher.queue(b2)
        assert.strictEqual(updateCount, 0)
        assert.notOk(b1.updated)
        assert.notOk(b2.updated)

        nextTick(function () {
            assert.strictEqual(updateCount, 2)
            assert.ok(b1.updated)
            assert.ok(b2.updated)
            done()
        })

    })

    it('should not queue dupicate bindings', function (done) {
        
        updateCount = 0
        var b1 = mockBinding(1),
            b2 = mockBinding(1)
        batcher.queue(b1)
        batcher.queue(b2)

        nextTick(function () {
            assert.strictEqual(updateCount, 1)
            assert.ok(b1.updated)
            assert.notOk(b2.updated)
            done()
        })

    })

    it('should queue dependency bidnings triggered during flush', function (done) {
        
        updateCount = 0
        var b1 = mockBinding(1),
            b2 = mockBinding(2, function () {
                batcher.queue(b1)
            })
        batcher.queue(b2)

        nextTick(function () {
            assert.strictEqual(updateCount, 2)
            assert.ok(b1.updated)
            assert.ok(b2.updated)
            done()
        })

    })

})