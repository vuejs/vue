var _ = require('src/util')

describe('Util - Environment', function () {
  describe('nextTick', function () {
    it('should accept context', function (done) {
      var ctx = {}
      _.nextTick(function () {
        this.id = 1
      }, ctx)
      _.nextTick(function () {
        expect(ctx.id).toBe(1)
        done()
      })
    })
  })
})
