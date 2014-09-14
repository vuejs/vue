var _ = require('../../../../src/util')
var def = require('../../../../src/directives/transition')

if (_.inBrowser) {
  describe('v-transition', function () {

    it('should save the transition id as data', function () {
      var dir = {
        el: document.createElement('div'),
        expression: 'test',
        bind: def.bind
      }
      dir.bind()
      expect(dir.el.__v_trans.id).toBe('test')
    })

  })
}