var _ = require('src/util')
var Vue = require('src')

function trigger (target, event, process) {
  var e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  if (process) process(e)
  target.dispatchEvent(e)
  return e
}

describe('v-on', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('methods', function () {
    var spy = jasmine.createSpy()
    var vm = new Vue({
      el: el,
      template: '<a v-on:click="test"></a>',
      data: {a: 1},
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

  it('shorthand', function () {
    var spy = jasmine.createSpy()
    var vm = new Vue({
      el: el,
      template: '<a @click="test"></a>',
      data: {a: 1},
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
    new Vue({
      el: el,
      template: '<a v-on:click="a++">{{a}}</a>',
      data: {a: 1}
    })
    var a = el.firstChild
    trigger(a, 'click')
    _.nextTick(function () {
      expect(a.textContent).toBe('2')
      done()
    })
  })

  it('with key modifier', function (done) {
    new Vue({
      el: el,
      template: '<a v-on:keyup.enter="test">{{a}}</a>',
      data: {a: 1},
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

  it('with delete modifier capturing DEL', function (done) {
    new Vue({
      el: el,
      template: '<a v-on:keyup.delete="test">{{a}}</a>',
      data: {a: 1},
      methods: {
        test: function () {
          this.a++
        }
      }
    })
    var a = el.firstChild
    trigger(a, 'keyup', function (e) {
      e.keyCode = 46
    })
    _.nextTick(function () {
      expect(a.textContent).toBe('2')
      done()
    })
  })

  it('with delete modifier capturing backspace', function (done) {
    new Vue({
      el: el,
      template: '<a v-on:keyup.delete="test">{{a}}</a>',
      data: {a: 1},
      methods: {
        test: function () {
          this.a++
        }
      }
    })
    var a = el.firstChild
    trigger(a, 'keyup', function (e) {
      e.keyCode = 8
    })
    _.nextTick(function () {
      expect(a.textContent).toBe('2')
      done()
    })
  })

  it('with key modifier (keycode)', function (done) {
    new Vue({
      el: el,
      template: '<a v-on:keyup.13="test">{{a}}</a>',
      data: {a: 1},
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

  it('with key modifier (letter)', function (done) {
    new Vue({
      el: el,
      template: '<a v-on:keyup.a="test">{{a}}</a>',
      data: {a: 1},
      methods: {
        test: function () {
          this.a++
        }
      }
    })
    var a = el.firstChild
    trigger(a, 'keyup', function (e) {
      e.keyCode = 65
    })
    _.nextTick(function () {
      expect(a.textContent).toBe('2')
      done()
    })
  })

  it('stop modifier', function () {
    var outer = jasmine.createSpy('outer')
    var inner = jasmine.createSpy('inner')
    new Vue({
      el: el,
      template: '<div @click="outer"><div class="inner" @click.stop="inner"></div></div>',
      methods: {
        outer: outer,
        inner: inner
      }
    })
    trigger(el.querySelector('.inner'), 'click')
    expect(inner).toHaveBeenCalled()
    expect(outer).not.toHaveBeenCalled()
  })

  it('prevent modifier', function () {
    var prevented
    new Vue({
      el: el,
      template: '<a href="#" @click.prevent="onClick">',
      methods: {
        onClick: function (e) {
          // store the prevented state now:
          // IE will reset the `defaultPrevented` flag
          // once the event handler call stack is done!
          prevented = e.defaultPrevented
        }
      }
    })
    trigger(el.firstChild, 'click')
    expect(prevented).toBe(true)
  })

  it('prevent modifier with no value', function () {
    new Vue({
      el: el,
      template: '<a href="#123" @click.prevent>'
    })
    var hash = window.location.hash
    trigger(el.firstChild, 'click')
    expect(window.location.hash).toBe(hash)
  })

  it('capture modifier', function () {
    document.body.appendChild(el)
    var outer = jasmine.createSpy('outer')
    var inner = jasmine.createSpy('inner')
    new Vue({
      el: el,
      template: '<div @click.capture.stop="outer"><div class="inner" @click="inner"></div></div>',
      methods: {
        outer: outer,
        inner: inner
      }
    })
    trigger(el.querySelector('.inner'), 'click')
    expect(outer).toHaveBeenCalled()
    expect(inner).not.toHaveBeenCalled()
    document.body.removeChild(el)
  })

  it('self modifier', function () {
    var outer = jasmine.createSpy('outer')
    new Vue({
      el: el,
      template: '<div class="outer" @click.self="outer"><div class="inner"></div></div>',
      methods: {
        outer: outer
      }
    })
    trigger(el.querySelector('.inner'), 'click')
    expect(outer).not.toHaveBeenCalled()
    trigger(el.querySelector('.outer'), 'click')
    expect(outer).toHaveBeenCalled()
  })

  it('multiple modifiers working together', function () {
    var outer = jasmine.createSpy('outer')
    var prevented
    new Vue({
      el: el,
      template: '<div @keyup="outer"><input class="inner" @keyup.enter.stop.prevent="inner"></div></div>',
      methods: {
        outer: outer,
        inner: function (e) {
          prevented = e.defaultPrevented
        }
      }
    })
    trigger(el.querySelector('.inner'), 'keyup', function (e) {
      e.keyCode = 13
    })
    expect(outer).not.toHaveBeenCalled()
    expect(prevented).toBe(true)
  })

  it('warn non-function values', function () {
    new Vue({
      el: el,
      data: { test: 123 },
      template: '<a v-on:keyup="test"></a>'
    })
    expect('expects a function value').toHaveBeenWarned()
  })

  it('iframe', function () {
    // iframes only gets contentWindow when inserted
    // into the document
    document.body.appendChild(el)
    var spy = jasmine.createSpy()
    var vm = new Vue({
      el: el,
      template: '<iframe v-on:click="test"></iframe>',
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

  it('passing $event', function () {
    var test = jasmine.createSpy()
    new Vue({
      el: el,
      template: '<a v-on:click="test($event)"></a>',
      methods: {
        test: test
      }
    })
    var e = trigger(el.firstChild, 'click')
    expect(test).toHaveBeenCalledWith(e)
  })

  it('passing $event on a nested instance', function () {
    var test = jasmine.createSpy()
    var parent = new Vue({
      methods: {
        test: test
      }
    })
    var child = new Vue({
      el: el,
      template: '<a v-on:click="$parent.test($event)"></a>',
      parent: parent
    })
    var e = trigger(child.$el.firstChild, 'click')
    expect(test).toHaveBeenCalledWith(e)
  })
})
