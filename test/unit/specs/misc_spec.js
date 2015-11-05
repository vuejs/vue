// test cases for edge cases & bug fixes
var Vue = require('../../../src/vue')
// spies on different objects
var _ = require('../../../src/util/debug')
var __ = Vue.util

describe('Misc', function () {

  beforeEach(function () {
    spyOn(_, 'warn')
    spyOn(__, 'warn')
  })

  it('should handle directive.bind() altering its childNode structure', function () {
    var vm = new Vue({
      el: document.createElement('div'),
      template: '<div v-test>{{test}}</div>',
      data: {
        test: 'hi'
      },
      directives: {
        test: {
          bind: function () {
            this.el.insertBefore(document.createTextNode('yo '),
              this.el.firstChild)
          }
        }
      }
    })
    expect(vm.$el.textContent).toBe('yo hi')
  })

  it('attached/detached hooks for transcluded components', function () {
    var spy1 = jasmine.createSpy('attached')
    var spy2 = jasmine.createSpy('detached')
    var el = document.createElement('div')
    el.innerHTML = '<outer v-ref:outter><inner></inner></outer>'
    document.body.appendChild(el)

    var vm = new Vue({
      el: el,
      components: {
        outer: {
          template: '<slot></slot>'
        },
        inner: {
          template: 'hi',
          attached: spy1,
          detached: spy2
        }
      }
    })
    expect(spy1).toHaveBeenCalled()
    vm.$refs.outter.$remove()
    expect(spy2).toHaveBeenCalled()
  })

  it('v-for on component root node with replace:true', function () {
    var el = document.createElement('div')
    var vm = new Vue({
      el: el,
      template: '<test></test>',
      components: {
        test: {
          data: function () {
            return { list: [1, 2, 3] }
          },
          template: '<div v-for="n in list">{{n}}</div>',
          replace: true
        }
      }
    })
    expect(vm.$el.innerHTML).toBe('<div>1</div><div>2</div><div>3</div>')
  })

  // #922
  it('template v-for inside svg', function () {
    var el = document.createElement('div')
    new Vue({
      el: el,
      template: '<svg><template v-for="n in list"><text>{{n}}</text></template></svg>',
      data: {
        list: [1, 2, 3]
      }
    })
    // IE inlines svg namespace
    var xmlns = /\s?xmlns=".*svg"/
    expect(el.innerHTML.replace(xmlns, '')).toBe('<svg><text>1</text><text>2</text><text>3</text></svg>')
  })

  // #1005
  it('call lifecycle hooks for child components', function () {
    Vue.options.replace = true
    var el = document.createElement('div')
    var logs = []
    function log (n) {
      return function () {
        logs.push(n)
      }
    }
    document.body.appendChild(el)
    var vm = new Vue({
      el: el,
      attached: log(0),
      ready: log(1),
      detached: log(2),
      beforeDestroy: log(3),
      destroyed: log(4),
      template: '<div><test></test><test></test></div>',
      components: {
        test: {
          template: '<span>hi</span>',
          attached: log(5),
          ready: log(6),
          detached: log(7),
          beforeDestroy: log(8),
          destroyed: log(9)
        }
      }
    })
    expect(vm.$el.innerHTML).toBe('<span>hi</span><span>hi</span>')
    expect(logs.join()).toBe('0,5,6,5,6,1')
    logs = []
    vm.$destroy(true)
    expect(logs.join()).toBe('3,8,9,8,9,2,7,7,4')
    Vue.options.replace = false
  })

  // #1006
  it('destroyed hook for components inside v-if', function (done) {
    var spy = jasmine.createSpy('v-if destroyed hook')
    var vm = new Vue({
      el: document.createElement('div'),
      template: '<template v-if="ok"><test></test></template>',
      data: {
        ok: true
      },
      components: {
        test: {
          destroyed: spy
        }
      }
    })
    vm.ok = false
    Vue.nextTick(function () {
      expect(spy).toHaveBeenCalled()
      done()
    })
  })

  it('frozen model, root', function (done) {
    var vm = new Vue({
      el: document.createElement('div'),
      template: '{{msg}}',
      data: Object.freeze({
        msg: 'hi!'
      })
    })
    expect(vm.$el.textContent).toBe('hi!')
    vm.msg = 'ho!'
    Vue.nextTick(function () {
      expect(vm.$el.textContent).toBe('hi!')
      done()
    })
  })

  it('frozen model, non-root', function (done) {
    var vm = new Vue({
      el: document.createElement('div'),
      template: '{{msg}} {{frozen.msg}}',
      data: {
        msg: 'hi',
        frozen: Object.freeze({
          msg: 'frozen'
        })
      }
    })
    expect(vm.$el.textContent).toBe('hi frozen')
    vm.msg = 'ho'
    vm.frozen.msg = 'changed'
    Vue.nextTick(function () {
      expect(vm.$el.textContent).toBe('ho frozen')
      done()
    })
  })

  it('should not trigger deep/Array watchers when digesting', function (done) {
    var spy1 = jasmine.createSpy('deep')
    var spy2 = jasmine.createSpy('Array')
    var spy3 = jasmine.createSpy('test')
    var spy4 = jasmine.createSpy('deep-mutated')
    var vm = new Vue({
      el: document.createElement('div'),
      data: {
        obj: {},
        arr: [],
        obj2: {}
      },
      watch: {
        obj: {
          handler: spy1,
          deep: true
        },
        arr: spy2,
        // if the watcher is watching the added value,
        // it should still trigger properly
        test: {
          handler: spy3,
          deep: true
        },
        // if the object is in fact mutated, it should
        // still trigger.
        obj2: {
          handler: spy4,
          deep: true
        }
      }
    })
    var test = []
    var obj2 = vm.obj2
    vm.$set('test', test)
    __.set(obj2, 'test', 123)
    Vue.nextTick(function () {
      expect(spy1).not.toHaveBeenCalled()
      expect(spy2).not.toHaveBeenCalled()
      expect(spy3).toHaveBeenCalledWith(test, undefined)
      expect(spy4).toHaveBeenCalledWith(obj2, obj2)
      done()
    })
  })

  it('handle interpolated textarea', function (done) {
    var el = document.createElement('div')
    el.innerHTML = '<textarea>hello {{msg}}</textarea>'
    var vm = new Vue({
      el: el,
      data: {
        msg: 'test'
      }
    })
    expect(el.innerHTML).toBe('<textarea>hello test</textarea>')
    vm.msg = 'world'
    Vue.nextTick(function () {
      expect(el.innerHTML).toBe('<textarea>hello world</textarea>')
      done()
    })
  })

  it('nested object $set should trigger parent array notify', function (done) {
    var vm = new Vue({
      el: document.createElement('div'),
      template: '{{items | json}}{{items[0].a}}',
      data: {
        items: [{}]
      }
    })
    expect(vm.$el.textContent).toBe(JSON.stringify(vm.items, null, 2))
    __.set(vm.items[0], 'a', 123)
    Vue.nextTick(function () {
      expect(vm.$el.textContent).toBe(JSON.stringify(vm.items, null, 2) + '123')
      done()
    })
  })

  it('warn unkown custom element', function () {
    new Vue({
      el: document.createElement('div'),
      template: '<custom-stuff></custom-stuff>'
    })
    expect(hasWarned(__, 'Unknown custom element')).toBe(true)
  })

  it('prefer bound attributes over static attributes', function (done) {
    var el = document.createElement('div')
    var count = 0
    var expected = [
      'bound',
      'bound',
      'static',
      'bound',
      'bound'
    ]
    function check (title) {
      expect(title).toBe(expected[count])
      count++
      if (count === 4) {
        done()
      }
    }

    new Vue({
      el: el,
      template:
        '<div>\
          <comp v-bind:title="title"></comp>\
          <comp title="static" v-bind:title="title"></comp>\
          <comp title="static"></comp>\
          <comp :title="title"></comp>\
          <comp title="static" :title="title"></comp>\
        </div>',
      data: {
        title: 'bound'
      },
      components: {
        comp: {
          props: ['title'],
          created: function () {
            check(this.title)
          }
        }
      }
    })
  })

  it('deep watch for class, style and bind', function (done) {
    var el = document.createElement('div')
    var vm = new Vue({
      el: el,
      template: '<div :class="classes" :style="styles" v-bind="attrs"></div>',
      data: {
        classes: { a: true, b: false },
        styles: { color: 'red', fontSize: '14px' },
        attrs: { a: 1, b: 2 }
      }
    })
    var div = el.firstChild
    expect(div.className).toBe('a')
    expect(div.style.color).toBe('red')
    expect(div.style.fontSize).toBe('14px')
    expect(div.getAttribute('a')).toBe('1')
    expect(div.getAttribute('b')).toBe('2')
    vm.classes.b = true
    vm.styles.color = 'green'
    vm.attrs.a = 3
    Vue.nextTick(function () {
      expect(div.className).toBe('a b')
      expect(div.style.color).toBe('green')
      expect(div.style.fontSize).toBe('14px')
      expect(div.getAttribute('a')).toBe('3')
      expect(div.getAttribute('b')).toBe('2')
      done()
    })
  })
})
