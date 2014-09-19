var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

function trigger (target, event, process) {
  var e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  if (process) process(e)
  target.dispatchEvent(e)
}

if (_.inBrowser) {
  describe('v-model', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      document.body.appendChild(el)
      spyOn(_, 'warn')
    })

    afterEach(function () {
      document.body.removeChild(el)
    })

    it('radio buttons', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: 'a'
        },
        template:
          '<input type="radio" value="a" v-model="test" name="test">' +
          '<input type="radio" value="b" v-model="test" name="test">'
      })
      expect(el.childNodes[0].checked).toBe(true)
      expect(el.childNodes[1].checked).toBe(false)
      vm.test = 'b'
      _.nextTick(function () {
        expect(el.childNodes[0].checked).toBe(false)
        expect(el.childNodes[1].checked).toBe(true)
        el.childNodes[0].click()
        expect(el.childNodes[0].checked).toBe(true)
        expect(el.childNodes[1].checked).toBe(false)
        expect(vm.test).toBe('a')
        vm._directives[1].unbind()
        el.childNodes[1].click()
        expect(vm.test).toBe('a')
        done()
      })
    })

    it('radio default value', function () {
      var vm = new Vue({
        el: el,
        data: {},
        template: '<input type="radio" checked value="a" v-model="test">'
      })
      expect(vm.test).toBe('a')
    })

    it('checkbox', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: true
        },
        template: '<input type="checkbox" v-model="test">'
      })
      expect(el.firstChild.checked).toBe(true)
      vm.test = false
      _.nextTick(function () {
        expect(el.firstChild.checked).toBe(false)
        expect(vm.test).toBe(false)
        el.firstChild.click()
        expect(el.firstChild.checked).toBe(true)
        expect(vm.test).toBe(true)
        vm._directives[0].unbind()
        el.firstChild.click()
        expect(el.firstChild.checked).toBe(false)
        expect(vm.test).toBe(true)
        done()
      })
    })

    it('checkbox default value', function () {
      var vm = new Vue({
        el: el,
        data: {},
        template: '<input type="checkbox" checked v-model="test">'
      })
      expect(vm.test).toBe(true)
    })

    it('select', function () {
      
    })

    it('select + options', function () {
      
    })

    it('text', function () {
      
    })

    it('text with filters', function () {
      
    })

    it('text + compositionevents', function () {
      
    })

    it('warn invalid', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-model="test"></div<'
      })
      expect(_.warn).toHaveBeenCalled()
    })

  })
}