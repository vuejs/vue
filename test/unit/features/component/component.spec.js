import Vue from 'vue'

describe('Component', () => {
  it('static', () => {
    const vm = new Vue({
      template: '<test></test>',
      components: {
        test: {
          data () {
            return { a: 123 }
          },
          template: '<span>{{a}}</span>'
        }
      }
    }).$mount()
    expect(vm.$el.tagName).toBe('SPAN')
    expect(vm.$el.innerHTML).toBe('123')
  })

  it('using component in restricted elements', () => {
    const vm = new Vue({
      template: '<div><table><tbody><test></test></tbody></table></div>',
      components: {
        test: {
          data () {
            return { a: 123 }
          },
          template: '<tr><td>{{a}}</td></tr>'
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<table><tbody><tr><td>123</td></tr></tbody></table>')
  })

  it('"is" attribute', () => {
    const vm = new Vue({
      template: '<div><table><tbody><tr is="test"></tr></tbody></table></div>',
      components: {
        test: {
          data () {
            return { a: 123 }
          },
          template: '<tr><td>{{a}}</td></tr>'
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<table><tbody><tr><td>123</td></tr></tbody></table>')
  })

  it('inline-template', () => {
    const vm = new Vue({
      template: '<div><test inline-template><span>{{a}}</span></test></div>',
      data: {
        a: 'parent'
      },
      components: {
        test: {
          data () {
            return { a: 'child' }
          }
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>child</span>')
  })

  it('fragment instance warning', () => {
    new Vue({
      template: '<test></test>',
      components: {
        test: {
          data () {
            return { a: 123, b: 234 }
          },
          template: '<p>{{a}}</p><p>{{b}}</p>'
        }
      }
    }).$mount()
    expect('Component template should contain exactly one root element').toHaveBeenWarned()
  })

  it('dynamic', done => {
    const vm = new Vue({
      template: '<component :is="view" :view="view"></component>',
      data: {
        view: 'view-a'
      },
      components: {
        'view-a': {
          template: '<div>foo</div>',
          data () {
            return { view: 'a' }
          }
        },
        'view-b': {
          template: '<div>bar</div>',
          data () {
            return { view: 'b' }
          }
        }
      }
    }).$mount()
    expect(vm.$el.outerHTML).toBe('<div view="view-a">foo</div>')
    vm.view = 'view-b'
    waitForUpdate(() => {
      expect(vm.$el.outerHTML).toBe('<div view="view-b">bar</div>')
      vm.view = ''
    })
    .then(() => {
      expect(vm.$el.nodeType).toBe(3)
      expect(vm.$el.data).toBe('')
    }).then(done)
  })

  it(':is using raw component constructor', () => {
    const vm = new Vue({
      template:
        '<div>' +
          '<component :is="$options.components.test"></component>' +
          '<component :is="$options.components.async"></component>' +
        '</div>',
      components: {
        test: {
          template: '<span>foo</span>'
        },
        async: function (resolve) {
          resolve({
            template: '<span>bar</span>'
          })
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>foo</span><span>bar</span>')
  })

  it('dynamic combined with v-for', done => {
    const vm = new Vue({
      template:
        '<div>' +
          '<component v-for="c in comps" :is="c.type"></component>' +
        '</div>',
      data: {
        comps: [{ type: 'one' }, { type: 'two' }]
      },
      components: {
        one: {
          template: '<span>one</span>'
        },
        two: {
          template: '<span>two</span>'
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>one</span><span>two</span>')
    vm.comps[1].type = 'one'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>one</span><span>one</span>')
    }).then(done)
  })

  it('should compile parent template directives & content in parent scope', done => {
    const vm = new Vue({
      data: {
        ok: false,
        message: 'hello'
      },
      template: '<test v-show="ok">{{message}}</test>',
      components: {
        test: {
          template: '<div><slot></slot> {{message}}</div>',
          data () {
            return {
              message: 'world'
            }
          }
        }
      }
    }).$mount()
    expect(vm.$el.style.display).toBe('none')
    expect(vm.$el.textContent).toBe('hello world')
    vm.ok = true
    vm.message = 'bye'
    waitForUpdate(() => {
      expect(vm.$el.style.display).toBe('')
      expect(vm.$el.textContent).toBe('bye world')
    }).then(done)
  })

  it('parent content + v-if', done => {
    const vm = new Vue({
      data: {
        ok: false,
        message: 'hello'
      },
      template: '<test v-if="ok">{{message}}</test>',
      components: {
        test: {
          template: '<div><slot></slot> {{message}}</div>',
          data () {
            return {
              message: 'world'
            }
          }
        }
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('')
    expect(vm.$children.length).toBe(0)
    vm.ok = true
    waitForUpdate(() => {
      expect(vm.$children.length).toBe(1)
      expect(vm.$el.textContent).toBe('hello world')
    }).then(done)
  })

  it('props', () => {
    const vm = new Vue({
      data: {
        list: [{ a: 1 }, { a: 2 }]
      },
      template: '<test :collection="list"></test>',
      components: {
        test: {
          template: '<ul><li v-for="item in collection">{{item.a}}</li></ul>',
          props: ['collection']
        }
      }
    }).$mount()
    expect(vm.$el.outerHTML).toBe('<ul><li>1</li><li>2</li></ul>')
  })

  it('not found component should not throw', () => {
    expect(function () {
      new Vue({
        template: '<div is="non-existent"></div>'
      })
    }).not.toThrow()
  })

  it('properly update replaced higher-order component root node', done => {
    const vm = new Vue({
      data: {
        color: 'red'
      },
      template: '<test id="foo" :class="color"></test>',
      components: {
        test: {
          data () {
            return { tag: 'div' }
          },
          render (h) {
            return h(this.tag, { class: 'test' }, 'hi')
          }
        }
      }
    }).$mount()

    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.id).toBe('foo')
    expect(vm.$el.className).toBe('test red')

    vm.color = 'green'
    waitForUpdate(() => {
      expect(vm.$el.tagName).toBe('DIV')
      expect(vm.$el.id).toBe('foo')
      expect(vm.$el.className).toBe('test green')
      vm.$children[0].tag = 'p'
    }).then(() => {
      expect(vm.$el.tagName).toBe('P')
      expect(vm.$el.id).toBe('foo')
      expect(vm.$el.className).toBe('test green')
      vm.color = 'red'
    }).then(() => {
      expect(vm.$el.tagName).toBe('P')
      expect(vm.$el.id).toBe('foo')
      expect(vm.$el.className).toBe('test red')
    }).then(done)
  })

  it('catch component render error and preserve previous vnode', done => {
    const spy = jasmine.createSpy()
    Vue.config.errorHandler = spy
    const vm = new Vue({
      data: {
        a: {
          b: 123
        }
      },
      render (h) {
        return h('div', [this.a.b])
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('123')
    expect(spy).not.toHaveBeenCalled()
    vm.a = null
    waitForUpdate(() => {
      expect('Error when rendering root instance').toHaveBeenWarned()
      expect(spy).toHaveBeenCalled()
      expect(vm.$el.textContent).toBe('123') // should preserve rendered DOM
      vm.a = { b: 234 }
    }).then(() => {
      expect(vm.$el.textContent).toBe('234') // should be able to recover
      Vue.config.errorHandler = null
    }).then(done)
  })
})
