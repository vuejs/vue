var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

// unset jQuery to bypass jQuery check for normal test cases
jQuery = null

/**
 * Mock event helper
 */

function trigger (target, event, process) {
  var e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  if (process) process(e)
  target.dispatchEvent(e)
}

/**
 * setting <select>'s value in IE9 doesn't work
 * we have to manually loop through the options
 */

function updateSelect (el, value) {
  /* jshint eqeqeq: false */
  var options = el.options
  var i = options.length
  while (i--) {
    if (options[i].value == value) {
        options[i].selected = true
        break
    }
  }
}

if (_.inBrowser) {
  describe('v-model', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      el.style.display = 'none'
      document.body.appendChild(el)
      spyOn(_, 'warn')
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
        updateSelect(el.firstChild, 'a')
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

    it('select + empty default value', function () {
      var vm = new Vue({
        el: el,
        template: '<select v-model="test"><option value="" selected>null</option><<option value="1">1</option></select>'
      })
      expect(vm.test).toBe('')
      trigger(vm.$el.firstChild, 'change')
      expect(vm.test).toBe('')
    })

    it('select + multiple', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: [2] // test number soft equal
        },
        template:
          '<select v-model="test" multiple>' +
            '<option>1</option>' +
            '<option>2</option>' +
            '<option>3</option>' +
          '</select>'
      })
      var opts = el.firstChild.options
      expect(opts[0].selected).toBe(false)
      expect(opts[1].selected).toBe(true)
      expect(opts[2].selected).toBe(false)
      vm.test = [1, '3'] // mix of number/string
      _.nextTick(function () {
        expect(opts[0].selected).toBe(true)
        expect(opts[1].selected).toBe(false)
        expect(opts[2].selected).toBe(true)
        opts[0].selected = false
        opts[1].selected = true
        trigger(el.firstChild, 'change')
        expect(vm.test[0]).toBe('2')
        expect(vm.test[1]).toBe('3')
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
        vm._directives[0]._teardown()
        expect(vm._watcherList.length).toBe(0)
        done()
      })
    })

    it('select + options + text', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b',
          opts: [
            { text: 'A', value: 'a' },
            { text: 'B', value: 'b' }
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
          '<option value="a">a</option><option value="b">b</option>' +
        '</optgroup>' +
        '<optgroup label="B">' +
          '<option value="c">c</option>' +
        '</optgroup>'
      )
      var opts = el.firstChild.options
      expect(opts[0].selected).toBe(false)
      expect(opts[1].selected).toBe(true)
      expect(opts[2].selected).toBe(false)
    })

    it('select + number', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: '1'
        },
        template: '<select v-model="test" number><option value="1">1</option></select>'
      })
      expect(vm.test).toBe('1')
      trigger(vm.$el.firstChild, 'change')
      expect(vm.test).toBe(1)
    })

    it('select + number + multiple', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: []
        },
        template: '<select v-model="test" multiple number><option>1</option><option>2</option></select>'
      })
      ;[].forEach.call(el.querySelectorAll('option'), function (o) {
        o.selected = true
      })
      trigger(el.firstChild, 'change')
      expect(vm.test[0]).toBe(1)
      expect(vm.test[1]).toBe(2)
    })

    it('select + number initial value', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: '1'
        },
        template: '<select v-model="test" number><option value="1" selected>1</option></select>'
      })
      expect(vm.test).toBe(1)
    })

    it('select + options + filter', function () {
      var vm = new Vue({
        el: el,
        data: {
          opts: ['a','b']
        },
        filters: {
          aFilter: function (opts){
            return opts.map(function (val,i){
              return val + i
            })
          }
        },
        template: '<select v-model="test" options="opts | aFilter"></select>'
      })
      expect(el.firstChild.innerHTML).toBe(
          '<option value="a0">a0</option>' +
          '<option value="b1">b1</option>'
      )
    })

    it('text', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b'
        },
        template: '<input v-model="test">'
      })
      expect(el.firstChild.value).toBe('b')
      vm.test = 'a'
      _.nextTick(function () {
        expect(el.firstChild.value).toBe('a')
        el.firstChild.value = 'c'
        trigger(el.firstChild, 'input')
        expect(vm.test).toBe('c')
        vm._directives[0].unbind()
        el.firstChild.value = 'd'
        trigger(el.firstChild, 'input')
        expect(vm.test).toBe('c')
        done()
      })
    })

    it('text default value', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b'
        },
        template: '<input v-model="test | test" value="a">',
        filters: {
          test: {
            read: function (v) {
              return v.slice(0, -1)
            },
            write: function (v) {
              return v + 'c'
            }
          }
        }
      })
      expect(vm.test).toBe('ac')
      expect(el.firstChild.value).toBe('a')
    })

    it('text lazy', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b'
        },
        template: '<input v-model="test" lazy>'
      })
      expect(el.firstChild.value).toBe('b')
      expect(vm.test).toBe('b')
      el.firstChild.value = 'c'
      trigger(el.firstChild, 'input')
      expect(vm.test).toBe('b')
      trigger(el.firstChild, 'change')
      expect(vm.test).toBe('c')
    })

    it('text with filters', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b'
        },
        filters: {
          test: {
            write: function (val) {
              return val.toLowerCase()
            }
          }
        },
        template: '<input v-model="test | uppercase | test">'
      })
      expect(el.firstChild.value).toBe('B')
      el.firstChild.value = 'cc'
      trigger(el.firstChild, 'input')
      _.nextTick(function () {
        expect(el.firstChild.value).toBe('CC')
        expect(vm.test).toBe('cc')
        done()
      })
    })

    // when there's only write filter, should allow
    // out of sync between the input field and actual data
    it('text with only write filter', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b'
        },
        filters: {
          test: {
            write: function (val) {
              return val.toUpperCase()
            }
          }
        },
        template: '<input v-model="test | test">'
      })
      el.firstChild.value = 'cc'
      trigger(el.firstChild, 'input')
      _.nextTick(function () {
        expect(el.firstChild.value).toBe('cc')
        expect(vm.test).toBe('CC')
        done()
      })
    })

    it('number', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: 1
        },
        template: '<input v-model="test" value="2" number>'
      })
      expect(vm.test).toBe(2)
      el.firstChild.value = 3
      trigger(el.firstChild, 'input')
      expect(vm.test).toBe(3)
    })

    it('IE9 cut and delete', function (done) {
      var ie9 = _.isIE9
      _.isIE9 = true
      var vm = new Vue({
        el: el,
        data: {
          test: 'aaa'
        },
        template: '<input v-model="test">'
      })
      var input = el.firstChild
      input.value = 'aa'
      trigger(input, 'cut')
      _.nextTick(function () {
        expect(vm.test).toBe('aa')
        input.value = 'a'
        trigger(input, 'keyup', function (e) {
          e.keyCode = 8
        })
        expect(vm.test).toBe('a')
        // teardown
        vm._directives[0].unbind()
        input.value = 'bbb'
        trigger(input, 'keyup', function (e) {
          e.keyCode = 8
        })
        expect(vm.test).toBe('a')
        _.isIE9 = ie9
        done()
      })
    })

    it('text + compositionevents', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: 'aaa',
          test2: 'bbb'
        },
        template: '<input v-model="test"><input v-model="test2 | uppercase">'
      })
      var input = el.firstChild
      var input2 = el.childNodes[1]
      trigger(input, 'compositionstart')
      trigger(input2, 'compositionstart')
      input.value = input2.value = 'ccc'
      // input before composition unlock should not call set
      trigger(input, 'input')
      trigger(input2, 'input')
      expect(vm.test).toBe('aaa')
      expect(vm.test2).toBe('bbb')
      // after composition unlock it should work
      trigger(input, 'compositionend')
      trigger(input2, 'compositionend')
      trigger(input, 'input')
      trigger(input2, 'input')
      expect(vm.test).toBe('ccc')
      expect(vm.test2).toBe('ccc')
      // IE complains about "unspecified error" when calling
      // setSelectionRange() on an input element that's been
      // removed from the DOM, so we wait until the
      // selection range callback has fired to end this test.
      _.nextTick(done)
    })

    it('textarea', function () {
      var vm = new Vue({
        el: el,
        data: {
          test: 'b',
          b: 'BB'
        },
        template: '<textarea v-model="test">a {{b}} c</textarea>'
      })
      expect(vm.test).toBe('a BB c')
      expect(el.firstChild.value).toBe('a BB c')
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

    it('warn read-only filters', function () {
      var vm = new Vue({
        el: el,
        template: '<input v-model="abc | test">',
        filters: {
          test: function (v) {
            return v
          }
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('support jQuery change event', function (done) {
      // restore jQuery
      jQuery = $
      var vm = new Vue({
        el: el,
        data: {
          test: 'b'
        },
        template: '<input v-model="test" lazy>'
      })
      expect(el.firstChild.value).toBe('b')
      vm.test = 'a'
      _.nextTick(function () {
        expect(el.firstChild.value).toBe('a')
        el.firstChild.value = 'c'
        jQuery(el.firstChild).trigger('change')
        expect(vm.test).toBe('c')
        vm._directives[0].unbind()
        el.firstChild.value = 'd'
        jQuery(el.firstChild).trigger('change')
        expect(vm.test).toBe('c')
        // unset jQuery
        jQuery = null
        done()
      })
    })

    it('support debounce', function (done) {
      var spy = jasmine.createSpy()
      var vm = new Vue({
        el: el,
        data: {
          test: 'a'
        },
        watch: {
          test: spy
        },
        template: '<input v-model="test" debounce="100">'
      })
      el.firstChild.value = 'b'
      trigger(el.firstChild, 'input')
      setTimeout(function () {
        el.firstChild.value = 'c'
        trigger(el.firstChild, 'input')
      }, 10)
      setTimeout(function () {
        el.firstChild.value = 'd'
        trigger(el.firstChild, 'input')
      }, 20)
      setTimeout(function () {
        expect(spy.calls.count()).toBe(0)
        expect(vm.test).toBe('a')
      }, 30)
      setTimeout(function () {
        expect(spy.calls.count()).toBe(1)
        expect(vm.test).toBe('d')
        done()
      }, 200)
    })

  })
}