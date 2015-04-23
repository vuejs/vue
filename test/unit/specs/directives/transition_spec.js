var _ = require('../../../../src/util')
var def = require('../../../../src/directives/transition')

if (_.inBrowser) {
  describe('v-transition', function () {

    it('should save the transition id and custom functions as data', function () {
      var fns = {}
      var dir = {
        el: document.createElement('div'),
        expression: 'test',
        bind: def.bind,
        vm: {
          $options: {
            transitions: {
              test: fns
            }
          }
        }
      }
      dir.bind()
      expect(dir.el.__v_trans.id).toBe('test')
      expect(dir.el.__v_trans.fns).toBe(fns)
    })

  })
}