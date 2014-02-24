describe('Batcher', function () {

    var Batcher = require('vue/src/batcher'),
        batcher = new Batcher(),
        nextTick = require('vue/src/utils').nextTick

    var updateCount = 0
    function mockJob (id, middleware) {
        return {
            id: id,
            execute: function () {
                updateCount++
                this.updated = true
                if (middleware) middleware()
            }
        }
    }
    
    it('should push bindings to be updated on nextTick', function (done) {
        
        updateCount = 0
        var b1 = mockJob(1),
            b2 = mockJob(2)
        batcher.push(b1)
        batcher.push(b2)
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

    it('should not push dupicate bindings', function (done) {
        
        updateCount = 0
        var b1 = mockJob(1),
            b2 = mockJob(1)
        batcher.push(b1)
        batcher.push(b2)

        nextTick(function () {
            assert.strictEqual(updateCount, 1)
            assert.ok(b1.updated)
            assert.notOk(b2.updated)
            done()
        })

    })

    it('should push dependency bidnings triggered during flush', function (done) {
        
        updateCount = 0
        var b1 = mockJob(1),
            b2 = mockJob(2, function () {
                batcher.push(b1)
            })
        batcher.push(b2)

        nextTick(function () {
            assert.strictEqual(updateCount, 2)
            assert.ok(b1.updated)
            assert.ok(b2.updated)
            done()
        })

    })

    it('should allow overriding jobs with same ID', function (done) {
        
        updateCount = 0
        var b1 = mockJob(1),
            b2 = mockJob(1)

        b2.override = true
        batcher.push(b1)
        batcher.push(b2)

        nextTick(function () {
            assert.strictEqual(updateCount, 1)
            assert.ok(b1.cancelled)
            assert.notOk(b1.updated)
            assert.ok(b2.updated)
            done()
        })

    })

    it('should execute the _preFlush hook', function (done) {
        
        var executed = false
        batcher._preFlush = function () {
            executed = true
        }
        batcher.push(mockJob(1))
        
        nextTick(function () {
            assert.ok(executed)
            done()
        })

    })

})