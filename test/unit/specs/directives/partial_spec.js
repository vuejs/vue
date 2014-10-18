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

    it('dynamic partial', function (done) {
      var vm = new Vue({
        el: el,
        template: '<div v-partial="{{partial}}"></div>',
        data: {
          msg: 'hello',
          partial: 'p1'
        },
        partials: {
          p1: '{{msg}}',
          p2: '<div v-component="child"></div>'
        },
        components: {
          child: {
            data: function () {
              return {a:123}
            },
            template: '{{a}}'
          }
        }
      })
      expect(el.firstChild.innerHTML).toBe('hello')
      expect(vm._directives.length).toBe(2)
      vm.partial = 'p2'
      _.nextTick(function () {
        expect(el.firstChild.innerHTML).toBe('<div>123</div><!--v-component-->')
        expect(vm._directives.length).toBe(2)
        expect(vm._children.length).toBe(1)
        vm.partial = 'p1'
        _.nextTick(function () {
          expect(el.firstChild.innerHTML).toBe('hello')
          expect(vm._directives.length).toBe(2)
          expect(vm._children.length).toBe(0)
          done()
        })
      })
    })

  })
}