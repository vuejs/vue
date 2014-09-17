var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

function trigger (target, event, process) {
  var e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  if (process) process(e)
  target.dispatchEvent(e)
}

if (_.inBrowser) {
  describe('v-on', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
    })

    it('methods', function () {
      var spy = jasmine.createSpy()
      var vm = new Vue({
        el: el,
        template: '<a v-on="click:test"></a>',
        data: {a:1},
        methods: {
          test: spy
        }
      })
      var a = el.firstChild
      trigger(a, 'click')
      expect(spy.calls.count()).toBe(1)
      vm.$destroy()
      trigger(a, 'click')
      expect(spy.calls.count()).toBe(1)
    })

    it('inline expression', function (done) {
      var vm = new Vue({
        el: el,
        template: '<a v-on="click:a++">{{a}}</a>',
        data: {a:1}
      })
      var a = el.firstChild
      trigger(a, 'click')
      _.nextTick(function () {
        expect(a.textContent).toBe('2')
        done()
      })
    })

    it('with key filter', function (done) {
      var vm = new Vue({
        el: el,
        template: '<a v-on="keyup:test | key enter">{{a}}</a>',
        data: {a:1},
        methods: {
          test: function () {
            this.a++
          }
        }
      })
      var a = el.firstChild
      trigger(a, 'keyup', function (e) {
        e.keyCode = 13
      })
      _.nextTick(function () {
        expect(a.textContent).toBe('2')
        done()
      })
    })

    it('warn non-function values', function () {
      var vm = new Vue({
        el: el,
        data: { test: 123 },
        template: '<a v-on="keyup:test"></a>'
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('iframe', function () {
      // iframes only gets contentWindow when inserted
      // into the document
      document.body.appendChild(el)
      var spy = jasmine.createSpy()
      var vm = new Vue({
        el: el,
        template: '<iframe v-on="click:test"></iframe>',
        methods: {
          test: spy
        }
      })
      var iframeDoc = el.firstChild.contentDocument
      trigger(iframeDoc, 'click')
      expect(spy.calls.count()).toBe(1)
      vm.$destroy()
      trigger(iframeDoc, 'click')
      expect(spy.calls.count()).toBe(1)
      document.body.removeChild(el)
    })

  })
}