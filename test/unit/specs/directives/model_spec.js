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

    it('select', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b'
        },
        template:
          '<select v-model="test">' +
            '<option>a</option>' +
            '<option>b</option>' +
            '<option>c</option>' +
          '</select>'
      })
      expect(vm.test).toBe('b')
      expect(el.firstChild.value).toBe('b')
      expect(el.firstChild.childNodes[1].selected).toBe(true)
      vm.test = 'c'
      _.nextTick(function () {
        expect(el.firstChild.value).toBe('c')
        expect(el.firstChild.childNodes[2].selected).toBe(true)
        el.firstChild.value = 'a'
        trigger(el.firstChild, 'change')
        expect(vm.test).toBe('a')
        done()
      })
    })

    it('select default value', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: 'a'
        },
        template:
          '<select v-model="test">' +
            '<option>a</option>' +
            '<option selected>b</option>' +
          '</select>'
      })
      expect(vm.test).toBe('b')
      expect(el.firstChild.value).toBe('b')
      expect(el.firstChild.childNodes[1].selected).toBe(true)
    })

    it('select + multiple', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: ['b']
        },
        template:
          '<select v-model="test" multiple>' +
            '<option>a</option>' +
            '<option>b</option>' +
            '<option>c</option>' +
          '</select>'
      })
      var opts = el.firstChild.options
      expect(opts[0].selected).toBe(false)
      expect(opts[1].selected).toBe(true)
      expect(opts[2].selected).toBe(false)
      vm.test = ['a', 'c']
      _.nextTick(function () {
        expect(opts[0].selected).toBe(true)
        expect(opts[1].selected).toBe(false)
        expect(opts[2].selected).toBe(true)
        opts[0].selected = false
        opts[1].selected = true
        trigger(el.firstChild, 'change')
        expect(vm.test[0]).toBe('b')
        expect(vm.test[1]).toBe('c')
        done()
      })
    })

    it('select + multiple default value', function () {
      var vm = new Vue({
        el: el,
        data: {},
        template:
          '<select v-model="test" multiple>' +
            '<option>a</option>' +
            '<option selected>b</option>' +
            '<option selected>c</option>' +
          '</select>'
      })
      expect(vm.test[0]).toBe('b')
      expect(vm.test[1]).toBe('c')
    })

    it('select + options', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b',
          opts: ['a', 'b', 'c']
        },
        template: '<select v-model="test" options="opts"></select>'
      })
      var opts = el.firstChild.options
      expect(opts.length).toBe(3)
      expect(opts[0].selected).toBe(false)
      expect(opts[1].selected).toBe(true)
      expect(opts[2].selected).toBe(false)
      vm.opts = ['b', 'c']
      _.nextTick(function () {
        expect(opts.length).toBe(2)
        expect(opts[0].selected).toBe(true)
        expect(opts[1].selected).toBe(false)
        // should teardown option watcher when unbind
        expect(vm._watcherList.length).toBe(2)
        vm._directives[0].unbind()
        expect(vm._watcherList.length).toBe(0)
        done()
      })
    })

    it('select + options + label', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b',
          opts: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' }
          ]
        },
        template: '<select v-model="test" options="opts"></select>'
      })
      expect(el.firstChild.innerHTML).toBe(
        '<option value="a">A</option>' +
        '<option value="b">B</option>'
      )
      var opts = el.firstChild.options
      expect(opts[0].selected).toBe(false)
      expect(opts[1].selected).toBe(true)
    })

    it('select + options + optgroup', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b',
          opts: [
            { label: 'A', options: ['a','b'] },
            { label: 'B', options: ['c'] }
          ]
        },
        template: '<select v-model="test" options="opts"></select>'
      })
      expect(el.firstChild.innerHTML).toBe(
        '<optgroup label="A">' +
          '<option>a</option><option>b</option>' +
        '</optgroup>' +
        '<optgroup label="B">' +
          '<option>c</option>' +
        '</optgroup>'
      )
      var opts = el.firstChild.options
      expect(opts[0].selected).toBe(false)
      expect(opts[1].selected).toBe(true)
      expect(opts[2].selected).toBe(false)
    })

    it('text', function () {
      
    })

    it('text with filters', function () {
      
    })

    it('text + compositionevents', function () {
      
    })

    it('warn invalid tag', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-model="test"></div>'
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('warn invalid option value', function () {
      var vm = new Vue({
        el: el,
        data: { a: 123 },
        template: '<select v-model="test" options="a"></select>'
      })
      expect(_.warn).toHaveBeenCalled()
    })

  })
}