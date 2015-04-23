var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-component', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      document.body.appendChild(el)
      spyOn(_, 'warn')
    })

    afterEach(function () {
      document.body.removeChild(el)
    })

    it('static', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test"></div>',
        components: {
          test: {
            data: function () {
              return { a: 123 }
            },
            template: '{{a}}'
          }
        }
      })
      expect(el.innerHTML).toBe('<div>123</div><!--v-component-->')
    })

    it('replace', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test"></div>',
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
      expect(el.innerHTML).toBe('<p>123</p><!--v-component-->')
    })

    it('inline-template', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test" inline-template>{{a}}</div>',
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
      expect(el.innerHTML).toBe('<div>child</div><!--v-component-->')
    })

    it('block replace', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-component="test"></div>',
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
      expect(el.innerHTML).toBe('<!--v-start--><p>123</p><p>234</p><!--v-end--><!--v-component-->')
    })

    it('dynamic', function (done) {
      var vm = new Vue({
        el: el,
        template: '<div v-component="{{view}}" v-attr="view:view"></div>',
        data: {
          view: 'a'
        },
        components: {
          a: {
            template: 'AAA',
            data: function () {
              return { view: 'a' }
            }
          },
          b: {
            template: 'BBB',
            data: function () {
              return { view: 'b' }
            }
          }
        }
      })
      expect(el.innerHTML).toBe('<div view="a">AAA</div><!--v-component-->')
      vm.view = 'b'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div view="b">BBB</div><!--v-component-->')
        vm.view = ''
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<!--v-component-->')
          done()
        })
      })
    })

    it('keep-alive', function (done) {
      var spyA = jasmine.createSpy()
      var spyB = jasmine.createSpy()
      var vm = new Vue({
        el: el,
        template: '<div v-component="{{view}}" keep-alive></div>',
        data: {
          view: 'a'
        },
        components: {
          a: {
            created: spyA,
            template: 'AAA'
          },
          b: {
            created: spyB,
            template: 'BBB'
          }
        }
      })
      expect(el.innerHTML).toBe('<div>AAA</div><!--v-component-->')
      expect(spyA.calls.count()).toBe(1)
      expect(spyB.calls.count()).toBe(0)
      vm.view = 'b'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div>BBB</div><!--v-component-->')
        expect(spyA.calls.count()).toBe(1)
        expect(spyB.calls.count()).toBe(1)
        vm.view = 'a'
        _.nextTick(function () {
          expect(el.innerHTML).toBe('<div>AAA</div><!--v-component-->')
          expect(spyA.calls.count()).toBe(1)
          expect(spyB.calls.count()).toBe(1)
          vm.view = 'b'
          _.nextTick(function () {
            expect(el.innerHTML).toBe('<div>BBB</div><!--v-component-->')
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
        template: '<div v-component="test" v-show="ok">{{message}}</div>',
        components: {
          test: {
            template: '<div><content></content> {{message}}</div>',
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
        template: '<div v-component="test" v-if="ok">{{message}}</div>',
        components: {
          test: {
            template: '<content></content> {{message}}',
            data: function () {
              return {
                message: 'world'
              }
            }
          }
        }
      })
      expect(el.textContent).toBe('')
      expect(vm._children.length).toBe(0)
      expect(vm._directives.length).toBe(1) // v-if
      vm.ok = true
      _.nextTick(function () {
        expect(vm._children.length).toBe(1)
        expect(vm._directives.length).toBe(3) // v-if, v-component, v-text
        expect(el.textContent).toBe('hello world')
        done()
      })
    })

    it('paramAttributes', function () {
      var vm = new Vue({
        el: el,
        data: {
          list: [{a:1}, {a:2}]
        },
        template: '<ul v-component="test" collection="{{list}}"></ul>',
        components: {
          test: {
            template: '<li v-repeat="collection">{{a}}</li>',
            paramAttributes: ['collection']
          }
        }
      })
      expect(el.innerHTML).toBe('<ul><li>1</li><li>2</li><!--v-repeat--></ul><!--v-component-->')
    })

    it('wait-for', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          view: 'a'
        },
        template: '<div v-component="{{view}}" wait-for="ok"></div>',
        components: {
          a: {
            template: 'AAA'
          },
          b: {
            template: 'BBB'
          }
        }
      })
      vm._children[0].$emit('ok')
      vm.view = 'b'
      _.nextTick(function () {
        expect(el.textContent).toBe('AAA')
        // old vm is already removed, this is the new vm
        vm._children[0].$emit('ok')
        expect(el.textContent).toBe('BBB')
        done()
      })
    })

    it('transition-mode: in-out', function (done) {
      var spy1 = jasmine.createSpy('enter')
      var spy2 = jasmine.createSpy('leave')
      var next
      var vm = new Vue({
        el: el,
        data: {
          view: 'a'
        },
        template: '<div v-component="{{view}}" v-transition="test" transition-mode="in-out"></div>',
        components: {
          a: { template: 'AAA' },
          b: { template: 'BBB' }
        },
        transitions: {
          test: {
            enter: function (el, done) {
              spy1()
              next = done
            },
            leave: function (el, done) {
              spy2()
              done()
            }
          }
        }
      })
      expect(el.textContent).toBe('AAA')
      vm.view = 'b'
      _.nextTick(function () {
        expect(spy1).toHaveBeenCalled()
        expect(spy2).not.toHaveBeenCalled()
        expect(el.textContent).toBe('AAABBB')
        next()
        expect(spy2).toHaveBeenCalled()
        expect(el.textContent).toBe('BBB')
        done()
      })
    })

    it('transition-mode: out-in', function (done) {
      var spy1 = jasmine.createSpy('enter')
      var spy2 = jasmine.createSpy('leave')
      var next
      var vm = new Vue({
        el: el,
        data: {
          view: 'a'
        },
        template: '<div v-component="{{view}}" v-transition="test" transition-mode="out-in"></div>',
        components: {
          a: { template: 'AAA' },
          b: { template: 'BBB' }
        },
        transitions: {
          test: {
            enter: function (el, done) {
              spy2()
              done()
            },
            leave: function (el, done) {
              spy1()
              next = done
            }
          }
        }
      })
      expect(el.textContent).toBe('AAA')
      vm.view = 'b'
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
        template: '<div v-component="{{view}}" keep-alive></div>',
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
        expect(vm._children.length).toBe(2)
        var child = vm._children[0]
        var child2 = vm._children[1]
        vm._directives[0].unbind()
        expect(vm._directives[0].cache).toBeNull()
        expect(vm._children.length).toBe(0)
        expect(child._isDestroyed).toBe(true)
        expect(child2._isDestroyed).toBe(true)
        done()
      })
    })

    it('already mounted warn', function () {
      el.setAttribute('v-component', 'test')
      var vm = new Vue({
        el: el
      })
      expect(_.warn).toHaveBeenCalled()
    })

  })
}