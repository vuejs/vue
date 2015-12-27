var _ = require('src/util')
var Vue = require('src')

describe('Component', function () {

  var el
  beforeEach(function () {
    el = document.createElement('div')
    document.body.appendChild(el)
    spyWarns()
  })

  afterEach(function () {
    document.body.removeChild(el)
  })

  it('static', function () {
    new Vue({
      el: el,
      template: '<test></test>',
      components: {
        test: {
          data: function () {
            return { a: 123 }
          },
          template: '{{a}}'
        }
      }
    })
    expect(el.innerHTML).toBe('<test>123</test>')
  })

  it('replace', function () {
    new Vue({
      el: el,
      template: '<test></test>',
      components: {
        test: {
          replace: true,
          data: function () {
            return { a: 123 }
          },
          template: '<p>{{a}}</p>'
        }
      }
    })
    expect(el.innerHTML).toBe('<p>123</p>')
  })

  it('"is" on table elements', function () {
    var vm = new Vue({
      el: el,
      template: '<table><tbody><tr is="test"></tr></tbody></table>',
      components: {
        test: {
          data: function () {
            return { a: 123 }
          },
          template: '<td>{{a}}</td>'
        }
      }
    })
    expect(el.innerHTML).toBe(vm.$options.template.replace(/<tr.*\/tr>/, '<tr><td>123</td></tr>'))
    expect(getWarnCount()).toBe(0)
  })

  it('inline-template', function () {
    new Vue({
      el: el,
      template: '<test inline-template>{{a}}</test>',
      data: {
        a: 'parent'
      },
      components: {
        test: {
          data: function () {
            return { a: 'child' }
          },
          template: 'child option template'
        }
      }
    })
    expect(el.innerHTML).toBe('<test>child</test>')
  })

  it('block replace', function () {
    new Vue({
      el: el,
      template: '<test></test>',
      components: {
        test: {
          replace: true,
          data: function () {
            return { a: 123, b: 234 }
          },
          template: '<p>{{a}}</p><p>{{b}}</p>'
        }
      }
    })
    expect(el.innerHTML).toBe('<p>123</p><p>234</p>')
  })

  it('dynamic', function (done) {
    var vm = new Vue({
      el: el,
      template: '<component :is="view" :view="view"></component>',
      data: {
        view: 'view-a'
      },
      components: {
        'view-a': {
          template: '<div>AAA</div>',
          replace: true,
          data: function () {
            return { view: 'a' }
          }
        },
        'view-b': {
          template: '<div>BBB</div>',
          replace: true,
          data: function () {
            return { view: 'b' }
          }
        }
      }
    })
    expect(el.innerHTML).toBe('<div view="view-a">AAA</div>')
    vm.view = 'view-b'
    _.nextTick(function () {
      expect(el.innerHTML).toBe('<div view="view-b">BBB</div>')
      vm.view = ''
      _.nextTick(function () {
        expect(el.innerHTML).toBe('')
        done()
      })
    })
  })

  it('keep-alive', function (done) {
    var spyA = jasmine.createSpy()
    var spyB = jasmine.createSpy()
    var vm = new Vue({
      el: el,
      template: '<component :is="view" keep-alive></component>',
      data: {
        view: 'view-a'
      },
      components: {
        'view-a': {
          created: spyA,
          template: '<div>AAA</div>',
          replace: true
        },
        'view-b': {
          created: spyB,
          template: '<div>BBB</div>',
          replace: true
        }
      }
    })
    expect(el.innerHTML).toBe('<div>AAA</div>')
    expect(spyA.calls.count()).toBe(1)
    expect(spyB.calls.count()).toBe(0)
    vm.view = 'view-b'
    _.nextTick(function () {
      expect(el.innerHTML).toBe('<div>BBB</div>')
      expect(spyA.calls.count()).toBe(1)
      expect(spyB.calls.count()).toBe(1)
      vm.view = 'view-a'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div>AAA</div>')
        expect(spyA.calls.count()).toBe(1)
        expect(spyB.calls.count()).toBe(1)
        vm.view = 'view-b'
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<div>BBB</div>')
          expect(spyA.calls.count()).toBe(1)
          expect(spyB.calls.count()).toBe(1)
          done()
        })
      })
    })
  })

  it('should compile parent template directives & content in parent scope', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        ok: false,
        message: 'hello'
      },
      template: '<test v-show="ok">{{message}}</test>',
      components: {
        test: {
          template: '<div><slot></slot> {{message}}</div>',
          replace: true,
          data: function () {
            return {
              message: 'world'
            }
          }
        }
      }
    })
    expect(el.firstChild.style.display).toBe('none')
    expect(el.firstChild.textContent).toBe('hello world')
    vm.ok = true
    vm.message = 'bye'
    _.nextTick(function () {
      expect(el.firstChild.style.display).toBe('')
      expect(el.firstChild.textContent).toBe('bye world')
      done()
    })
  })

  it('parent content + v-if', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        ok: false,
        message: 'hello'
      },
      template: '<test v-if="ok">{{message}}</test>',
      components: {
        test: {
          template: '<slot></slot> {{message}}',
          data: function () {
            return {
              message: 'world'
            }
          }
        }
      }
    })
    expect(el.textContent).toBe('')
    expect(vm.$children.length).toBe(0)
    expect(vm._directives.length).toBe(1) // v-if
    vm.ok = true
    _.nextTick(function () {
      expect(vm.$children.length).toBe(1)
      expect(vm._directives.length).toBe(3) // v-if, component, v-text
      expect(el.textContent).toBe('hello world')
      done()
    })
  })

  it('props', function () {
    new Vue({
      el: el,
      data: {
        list: [{a: 1}, {a: 2}]
      },
      template: '<test :collection="list"></test>',
      components: {
        test: {
          template: '<ul><li v-for="item in collection">{{item.a}}</li></ul>',
          replace: true,
          props: ['collection']
        }
      }
    })
    expect(el.innerHTML).toBe('<ul><li>1</li><li>2</li></ul>')
  })

  it('activate hook for static component', function (done) {
    new Vue({
      el: el,
      template: '<view-a></view-a>',
      components: {
        'view-a': {
          template: 'AAA',
          activate: function (ready) {
            setTimeout(function () {
              expect(el.textContent).toBe('')
              ready()
              expect(el.textContent).toBe('AAA')
              done()
            }, 0)
          }
        }
      }
    })
  })

  it('activate hook for dynamic components', function (done) {
    var next
    var vm = new Vue({
      el: el,
      data: {
        view: 'view-a'
      },
      template: '<component :is="view"></component>',
      components: {
        'view-a': {
          template: 'AAA',
          activate: function (ready) {
            next = ready
          }
        },
        'view-b': {
          template: 'BBB',
          activate: function (ready) {
            next = ready
          }
        }
      }
    })
    expect(next).toBeTruthy()
    expect(el.textContent).toBe('')
    next()
    expect(el.textContent).toBe('AAA')
    vm.view = 'view-b'
    _.nextTick(function () {
      expect(el.textContent).toBe('AAA')
      // old vm is already removed, this is the new vm
      expect(vm.$children.length).toBe(1)
      next()
      expect(el.textContent).toBe('BBB')
      // ensure switching before ready event correctly
      // cleans up the component being waited on.
      // see #1152
      vm.view = 'view-a'
      // store the ready callback for view-a
      var callback = next
      _.nextTick(function () {
        vm.view = 'view-b'
        _.nextTick(function () {
          expect(vm.$children.length).toBe(1)
          expect(vm.$children[0].$el.textContent).toBe('BBB')
          // calling view-a's ready callback here should not throw
          // because it should've been cancelled (#1994)
          expect(callback).not.toThrow()
          done()
        })
      })
    })
  })

  it('activate hook + keep-alive', function (done) {
    var next
    var vm = new Vue({
      el: el,
      data: {
        view: 'view-a'
      },
      template: '<component :is="view" keep-alive></component>',
      components: {
        'view-a': {
          template: 'AAA',
          activate: function (ready) {
            next = ready
          }
        },
        'view-b': {
          template: 'BBB',
          activate: function (ready) {
            next = ready
          }
        }
      }
    })
    next()
    expect(el.textContent).toBe('AAA')
    vm.view = 'view-b'
    _.nextTick(function () {
      expect(vm.$children.length).toBe(2)
      next()
      expect(el.textContent).toBe('BBB')
      vm.view = 'view-a'
      _.nextTick(function () {
        // should switch without the need to emit
        // because of keep-alive
        expect(el.textContent).toBe('AAA')
        done()
      })
    })
  })

  it('transition-mode: in-out', function (done) {
    var spy1 = jasmine.createSpy('enter')
    var spy2 = jasmine.createSpy('leave')
    var next
    var vm = new Vue({
      el: el,
      data: {
        view: 'view-a'
      },
      template: '<component :is="view" transition="test" transition-mode="in-out"></component>',
      components: {
        'view-a': { template: 'AAA' },
        'view-b': { template: 'BBB' }
      },
      transitions: {
        test: {
          enter: function (el, done) {
            spy1()
            next = done
          },
          leave: function (el, done) {
            spy2()
            _.nextTick(done)
          }
        }
      }
    })
    expect(el.textContent).toBe('AAA')
    vm.view = 'view-b'
    _.nextTick(function () {
      expect(spy1).toHaveBeenCalled()
      expect(spy2).not.toHaveBeenCalled()
      expect(el.textContent).toBe('AAABBB')
      next()
      _.nextTick(function () {
        expect(spy2).toHaveBeenCalled()
        _.nextTick(function () {
          expect(el.textContent).toBe('BBB')
          done()
        })
      })
    })
  })

  it('transition-mode: out-in', function (done) {
    var spy1 = jasmine.createSpy('enter')
    var spy2 = jasmine.createSpy('leave')
    var next
    var vm = new Vue({
      el: el,
      data: {
        view: 'view-a'
      },
      template: '<component :is="view" transition="test" transition-mode="out-in"></component>',
      components: {
        'view-a': { template: 'AAA' },
        'view-b': { template: 'BBB' }
      },
      transitions: {
        test: {
          enter: function (el, done) {
            spy2()
            _.nextTick(done)
          },
          leave: function (el, done) {
            spy1()
            next = done
          }
        }
      }
    })
    expect(el.textContent).toBe('AAA')
    vm.view = 'view-b'
    _.nextTick(function () {
      expect(spy1).toHaveBeenCalled()
      expect(spy2).not.toHaveBeenCalled()
      expect(el.textContent).toBe('AAA')
      next()
      expect(spy2).toHaveBeenCalled()
      expect(el.textContent).toBe('BBB')
      done()
    })
  })

  it('teardown', function (done) {
    var vm = new Vue({
      el: el,
      template: '<component :is="view" keep-alive></component>',
      data: {
        view: 'test'
      },
      components: {
        test: {},
        test2: {}
      }
    })
    vm.view = 'test2'
    _.nextTick(function () {
      expect(vm.$children.length).toBe(2)
      var child = vm.$children[0]
      var child2 = vm.$children[1]
      vm._directives[0].unbind()
      expect(vm._directives[0].cache).toBeNull()
      expect(vm.$children.length).toBe(0)
      expect(child._isDestroyed).toBe(true)
      expect(child2._isDestroyed).toBe(true)
      done()
    })
  })

  it('already mounted warn', function () {
    el.setAttribute('is', 'test')
    new Vue({
      el: el
    })
    expect(hasWarned('cannot mount component "test" on already mounted element')).toBe(true)
  })

  it('not found component should not throw', function () {
    expect(function () {
      new Vue({
        el: el,
        template: '<div is="non-existent"></div>'
      })
    }).not.toThrow()
  })
})
