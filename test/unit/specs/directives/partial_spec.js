var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-partial', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
    })

    it('element', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-partial="test"></div>',
        partials: {
          test: '<p>{{a}}</p><p>{{b}}</p>'
        },
        data: {
          a: 'A',
          b: 'B'
        }
      })
      expect(el.innerHTML).toBe('<div><p>A</p><p>B</p></div>')
    })

    it('inline', function () {
      var vm = new Vue({
        el: el,
        template: '<div>{{>test}}</div>',
        partials: {
          test: '<p>{{a}}</p><p>{{b}}</p>'
        },
        data: {
          a: 'A',
          b: 'B'
        }
      })
      expect(el.innerHTML).toBe('<div><p>A</p><p>B</p></div>')
    })

    it('not found', function () {
      var vm = new Vue({
        el: el,
        template: '<div>{{>test}}</div>'
      })
      expect(el.innerHTML).toBe('<div><!--v-partial--></div>')
    })

  })
}