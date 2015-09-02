var _ = require('../../../../../src/util')
var Vue = require('../../../../../src/vue')

if (_.inBrowser) {
  describe('v-pre', function () {

    it('should work', function () {
      var vm = new Vue({
        el: document.createElement('div'),
        template: '<div v-pre>{{a}}</div>',
        data: {
          a: 123
        }
      })
      expect(vm.$el.firstChild.textContent).toBe('{{a}}')
    })
  })
}
