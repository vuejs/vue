var _ = require('src/util')
var Vue = require('src')

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
  var options = el.options
  var i = options.length
  while (i--) {
    /* eslint-disable eqeqeq */
    if (options[i].value == value) {
    /* eslint-enable eqeqeq */
      options[i].selected = true
      break
    }
  }
}

describe('v-model', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
    el.style.display = 'none'
    document.body.appendChild(el)
  })

  it('radio buttons', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        test: '1'
      },
      template:
        '<input type="radio" value="1" v-model="test" name="test" number>' +
        '<input type="radio" value="2" v-model="test" name="test">'
    })
    expect(el.childNodes[0].checked).toBe(true)
    expect(el.childNodes[1].checked).toBe(false)
    vm.test = '2'
    _.nextTick(function () {
      expect(el.childNodes[0].checked).toBe(false)
      expect(el.childNodes[1].checked).toBe(true)
      el.childNodes[0].click()
      expect(el.childNodes[0].checked).toBe(true)
      expect(el.childNodes[1].checked).toBe(false)
      expect(vm.test).toBe(1)
      vm._directives[1]._teardown()
      el.childNodes[1].click()
      expect(vm.test).toBe(1)
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

  it('radio expression', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        test: false,
        test2: 'string1',
        expression1: 'string1',
        expression2: 'string2'
      },
      template:
        '<input type="radio" value="1" v-model="test" name="test" :value="true">' +
        '<input type="radio" value="0" v-model="test" name="test" :value="false">' +
        '<input type="radio" value="1" v-model="test2" name="test2" :value="expression1">' +
        '<input type="radio" value="0" v-model="test2" name="test2" :value="expression2">'
    })
    expect(el.childNodes[0].checked).toBe(false)
    expect(el.childNodes[1].checked).toBe(true)
    expect(el.childNodes[2].checked).toBe(true)
    expect(el.childNodes[3].checked).toBe(false)
    _.nextTick(function () {
      el.childNodes[0].click()
      expect(vm.test).toBe(true)
      el.childNodes[3].click()
      expect(vm.test2).toBe('string2')
      done()
    })
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
      vm._directives[0]._teardown()
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

  it('checkbox expression', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        test: '',
        expression1: 'aTrueValue',
        expression2: 'aFalseValue'
      },
      template: '<input type="checkbox" v-model="test" :true-value="expression1" :false-value="expression2">'
    })
    expect(vm.test).toBe('')
    el.firstChild.click()
    expect(vm.test).toBe('aTrueValue')
    expect(el.firstChild.checked).toBe(true)
    el.firstChild.click()
    expect(vm.test).toBe('aFalseValue')
    expect(el.firstChild.checked).toBe(false)
    _.nextTick(function () {
      vm.test = 'aTrueValue'
      _.nextTick(function () {
        expect(el.firstChild.checked).toBe(true)
        done()
      })
    })
  })

  it('checkbox + array model', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        list: [1],
        a: {}
      },
      template:
        '<input type="checkbox" v-model="list" number value="1">' +
        '<input type="checkbox" v-model="list" :value="a">'
    })
    expect(el.firstChild.checked).toBe(true)
    expect(el.lastChild.checked).toBe(false)
    el.firstChild.click()
    expect(vm.list.length).toBe(0)
    el.lastChild.click()
    expect(vm.list.length).toBe(1)
    expect(vm.list[0]).toBe(vm.a)
    el.firstChild.click()
    expect(vm.list.length).toBe(2)
    expect(vm.list[1]).toBe(1)
    vm.list = [vm.a]
    _.nextTick(function () {
      expect(el.firstChild.checked).toBe(false)
      expect(el.lastChild.checked).toBe(true)
      done()
    })
  })

  it('checkbox + array model default value', function () {
    var vm = new Vue({
      el: el,
      data: {
        list: [],
        a: {}
      },
      template:
        '<input type="checkbox" v-model="list" number value="1">' +
        '<input type="checkbox" checked v-model="list" :value="a">'
    })
    expect(vm.list.length).toBe(1)
    expect(vm.list[0]).toBe(vm.a)
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

  it('select persist non-selected on append', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        test: null
      },
      replace: true,
      template:
        '<select v-model="test">' +
          '<option>a</option>' +
          '<option>b</option>' +
          '<option>c</option>' +
        '</select>'
    })
    _.nextTick(function () {
      expect(vm.$el.value).toBe('')
      expect(vm.$el.selectedIndex).toBe(-1)
      vm.$remove()
      vm.$appendTo(document.body)
      _.nextTick(function () {
        expect(vm.$el.value).toBe('')
        expect(vm.$el.selectedIndex).toBe(-1)
        done()
      })
    })
  })

  it('select template default value', function () {
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

  it('select + v-for', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        test: { msg: 'A' },
        opts: [
          { text: 'a', value: { msg: 'A' }},
          { text: 'b', value: { msg: 'B' }}
        ]
      },
      template:
        '<select v-model="test">' +
          '<option v-for="op in opts" :value="op.value">{{op.text}}</option>' +
        '</select>'
    })
    var select = el.firstChild
    var opts = select.options
    expect(opts[0].selected).toBe(true)
    expect(opts[1].selected).toBe(false)
    expect(vm.test.msg).toBe('A')
    opts[1].selected = true
    trigger(select, 'change')
    _.nextTick(function () {
      expect(opts[0].selected).toBe(false)
      expect(opts[1].selected).toBe(true)
      expect(vm.test.msg).toBe('B')
      vm.test = { msg: 'A' }
      _.nextTick(function () {
        expect(opts[0].selected).toBe(true)
        expect(opts[1].selected).toBe(false)
        vm.test = { msg: 'C' }
        vm.opts.push({text: 'c', value: vm.test})
        _.nextTick(function () {
          // updating the opts array should force the
          // v-model to update
          expect(opts[0].selected).toBe(false)
          expect(opts[1].selected).toBe(false)
          expect(opts[2].selected).toBe(true)
          done()
        })
      })
    })
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
      vm._directives[0]._teardown()
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
    trigger(el.firstChild, 'focus')
    el.firstChild.value = 'cc'
    trigger(el.firstChild, 'input')
    _.nextTick(function () {
      expect(el.firstChild.value).toBe('cc')
      expect(vm.test).toBe('cc')
      trigger(el.firstChild, 'change')
      trigger(el.firstChild, 'blur')
      _.nextTick(function () {
        expect(el.firstChild.value).toBe('CC')
        expect(vm.test).toBe('cc')
        done()
      })
    })
  })

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
    trigger(el.firstChild, 'focus')
    el.firstChild.value = 'cc'
    trigger(el.firstChild, 'input')
    _.nextTick(function () {
      expect(el.firstChild.value).toBe('cc')
      expect(vm.test).toBe('CC')
      trigger(el.firstChild, 'change')
      trigger(el.firstChild, 'blur')
      _.nextTick(function () {
        expect(el.firstChild.value).toBe('CC')
        expect(vm.test).toBe('CC')
        done()
      })
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
        test: 'foo'
      },
      template: '<input v-model="test">'
    })
    var input = el.firstChild
    input.value = 'bar'
    trigger(input, 'cut')
    _.nextTick(function () {
      expect(vm.test).toBe('bar')
      input.value = 'a'
      trigger(input, 'keyup', function (e) {
        e.keyCode = 8
      })
      expect(vm.test).toBe('a')
      // teardown
      vm._directives[0]._teardown()
      input.value = 'bar'
      trigger(input, 'keyup', function (e) {
        e.keyCode = 8
      })
      expect(vm.test).toBe('a')
      _.isIE9 = ie9
      done()
    })
  })

  if (!_.isAndroid) {
    it('text + compositionevents', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          test: 'foo',
          test2: 'bar'
        },
        template: '<input v-model="test"><input v-model="test2 | uppercase">'
      })
      var input = el.firstChild
      var input2 = el.childNodes[1]
      trigger(input, 'compositionstart')
      trigger(input2, 'compositionstart')
      input.value = input2.value = 'baz'
      // input before composition unlock should not call set
      trigger(input, 'input')
      trigger(input2, 'input')
      expect(vm.test).toBe('foo')
      expect(vm.test2).toBe('bar')
      // after composition unlock it should work
      trigger(input, 'compositionend')
      trigger(input2, 'compositionend')
      trigger(input, 'input')
      trigger(input2, 'input')
      expect(vm.test).toBe('baz')
      expect(vm.test2).toBe('baz')
      // IE complains about "unspecified error" when calling
      // setSelectionRange() on an input element that's been
      // removed from the DOM, so we wait until the
      // selection range callback has fired to end this test.
      _.nextTick(done)
    })
  }

  it('textarea', function () {
    var vm = new Vue({
      el: el,
      data: {
        test: 'foo',
        b: 'bar'
      },
      template: '<textarea v-model="test">foo {{b}} baz</textarea>'
    })
    expect(vm.test).toBe('foo bar baz')
    expect(el.firstChild.value).toBe('foo bar baz')
  })

  it('warn invalid tag', function () {
    new Vue({
      el: el,
      template: '<div v-model="test"></div>'
    })
    expect('does not support element type').toHaveBeenWarned()
  })

  it('warn read-only filters', function () {
    new Vue({
      el: el,
      template: '<input v-model="abc | test">',
      filters: {
        test: function (v) {
          return v
        }
      }
    })
    expect('read-only filter').toHaveBeenWarned()
  })

  it('support jQuery change event', function (done) {
    // restore jQuery
    jQuery = $
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
      jQuery(el.firstChild).trigger('change')
      expect(vm.test).toBe('c')
      vm._directives[0]._teardown()
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
      expect(spy).toHaveBeenCalledWith('d', 'a')
      expect(vm.test).toBe('d')
      setTimeout(function () {
        el.firstChild.value = 'e'
        // change should trigger change instantly without debounce
        trigger(el.firstChild, 'change')
        trigger(el.firstChild, 'blur')
        _.nextTick(function () {
          expect(spy.calls.count()).toBe(2)
          expect(spy).toHaveBeenCalledWith('e', 'd')
          expect(vm.test).toBe('e')
          done()
        })
      }, 10)
    }, 200)
  })

  it('update on bind value change', function (done) {
    var vm = new Vue({
      el: el,
      template:
        '<input type="radio" v-model="a" checked :value="b">' +
        '<input type="radio" v-model="a" :value="c">',
      data: {
        a: 0,
        b: 1,
        c: 2
      }
    })
    // should sync inline-checked value to a
    expect(vm.a).toBe(1)
    vm.b = 3
    _.nextTick(function () {
      expect(vm.a).toBe(3)
      expect(el.firstChild.checked).toBe(true)
      expect(el.lastChild.checked).toBe(false)
      vm.a = 2
      _.nextTick(function () {
        expect(el.firstChild.checked).toBe(false)
        expect(el.lastChild.checked).toBe(true)
        done()
      })
    })
  })

  it('should not sync value on blur when parent fragment is removed', function (done) {
    el.style.display = ''
    var vm = new Vue({
      el: el,
      replace: false,
      template:
        '<form v-if="ok" @submit.prevent="save">' +
          '<input v-model="msg">' +
        '</form>',
      data: {
        ok: true,
        msg: 'foo'
      },
      methods: {
        save: function () {
          this.ok = false
          this.msg = ''
        }
      }
    })
    el.querySelector('input').focus()
    trigger(el.querySelector('form'), 'submit')
    _.nextTick(function () {
      expect(vm.msg).toBe('')
      done()
    })
  })
})
