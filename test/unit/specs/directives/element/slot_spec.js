var Vue = require('src')
var nextTick = Vue.nextTick

describe('Slot Distribution', function () {
  var el, vm, options
  beforeEach(function () {
    el = document.createElement('div')
    options = {
      el: el,
      data: {
        msg: 'self'
      }
    }
  })

  function mount () {
    vm = new Vue(options)
  }

  it('no content', function () {
    options.template = '<div><slot></slot></div>'
    mount()
    expect(el.firstChild.childNodes.length).toBe(0)
  })

  it('default content', function () {
    el.innerHTML = '<p>foo</p>'
    options.template = '<div><slot></slot></div>'
    mount()
    expect(el.firstChild.tagName).toBe('DIV')
    expect(el.firstChild.firstChild.tagName).toBe('P')
    expect(el.firstChild.firstChild.textContent).toBe('foo')
  })

  it('no template auto content', function () {
    el.innerHTML = '<p>foo</p>'
    options._asComponent = true
    mount()
    expect(el.firstChild.tagName).toBe('P')
    expect(el.firstChild.textContent).toBe('foo')
  })

  it('fallback content', function () {
    options.template = '<slot><p>{{msg}}</p></slot>'
    mount()
    expect(el.firstChild.tagName).toBe('P')
    expect(el.firstChild.textContent).toBe('self')
  })

  it('fallback content with multiple named slots', function () {
    el.innerHTML = '<p slot="b">slot b</p>'
    options.template =
      '<slot name="a"><p>fallback a</p></slot>' +
      '<slot name="b">fallback b</slot>'
    mount()
    expect(el.childNodes.length).toBe(2)
    expect(el.firstChild.textContent).toBe('fallback a')
    expect(el.lastChild.textContent).toBe('slot b')
  })

  it('fallback content with mixed named/unnamed slots', function () {
    el.innerHTML = '<p slot="b">slot b</p>'
    options.template =
      '<slot><p>fallback a</p></slot>' +
      '<slot name="b">fallback b</slot>'
    mount()
    expect(el.childNodes.length).toBe(2)
    expect(el.firstChild.textContent).toBe('fallback a')
    expect(el.lastChild.textContent).toBe('slot b')
  })

  it('selector matching multiple elements', function () {
    el.innerHTML = '<p slot="t">1</p><div></div><p slot="t">2</p>'
    options.template = '<slot name="t"></slot>'
    mount()
    expect(el.innerHTML).toBe('<p slot="t">1</p><p slot="t">2</p>')
  })

  it('default content should only render parts not selected', function () {
    el.innerHTML = '<div>foo</div><p slot="a">1</p><p slot="b">2</p>'
    options.template =
      '<slot name="a"></slot>' +
      '<slot></slot>' +
      '<slot name="b"></slot>'
    mount()
    expect(el.innerHTML).toBe('<p slot="a">1</p><div>foo</div><p slot="b">2</p>')
  })

  it('content transclusion with replace', function () {
    el.innerHTML = '<p>foo</p>'
    options.template = '<div><div><slot></slot></div></div>'
    options.replace = true
    mount()
    var res = vm.$el
    expect(res).not.toBe(el)
    expect(res.firstChild.tagName).toBe('DIV')
    expect(res.firstChild.firstChild.tagName).toBe('P')
    expect(res.firstChild.firstChild.textContent).toBe('foo')
  })

  it('block instance content transclusion', function () {
    el.innerHTML = '<p slot="p">foo</p><span slot="span">ho</span>'
    options.template = '<div></div><slot name="p"></slot><slot name="span"></slot>'
    options.replace = true
    mount()
    expect(getChild(1).tagName).toBe('DIV')
    expect(getChild(2).tagName).toBe('P')
    expect(getChild(3).tagName).toBe('SPAN')

    function getChild (n) {
      var el = vm._fragmentStart
      while (n--) {
        el = el.nextSibling
      }
      return el
    }
  })

  it('name should only match children', function () {
    el.innerHTML =
      '<p slot="b">select b</p>' +
      '<span><p slot="b">nested b</p></span>' +
      '<span><p slot="c">nested c</p></span>'
    options.template =
      '<slot name="a"><p>fallback a</p></slot>' +
      '<slot name="b">fallback b</slot>' +
      '<slot name="c">fallback c</slot>'
    mount()
    expect(el.childNodes.length).toBe(3)
    expect(el.firstChild.textContent).toBe('fallback a')
    expect(el.childNodes[1].textContent).toBe('select b')
    expect(el.lastChild.textContent).toBe('fallback c')
  })

  it('should accept expressions in selectors', function () {
    el.innerHTML = '<p>one</p><p slot="two">two</p>'
    options.template = '<slot :name="theName"></slot>'
    options.data = {
      theName: 'two'
    }
    mount()
    expect(el.innerHTML).toBe('<p slot="two">two</p>')
  })

  it('content should be dynamic and compiled in parent scope', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        msg: 'foo'
      },
      template: '<test>{{msg}}</test>',
      components: {
        test: {
          template: '<slot></slot>'
        }
      }
    })
    expect(el.innerHTML).toBe('<test>foo</test>')
    vm.msg = 'bar'
    nextTick(function () {
      expect(el.innerHTML).toBe('<test>bar</test>')
      done()
    })
  })

  it('v-if with content transclusion', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        a: 1,
        b: 2,
        show: true
      },
      template: '<test :show="show"><p slot="b">{{b}}</a><p>{{a}}</p></test>',
      components: {
        test: {
          props: ['show'],
          template: '<div v-if="show"><slot></slot><slot name="b"></slot></div>'
        }
      }
    })
    expect(el.textContent).toBe('12')
    vm.a = 2
    nextTick(function () {
      expect(el.textContent).toBe('22')
      vm.show = false
      nextTick(function () {
        expect(el.textContent).toBe('')
        vm.show = true
        vm.a = 3
        nextTick(function () {
          expect(el.textContent).toBe('32')
          done()
        })
      })
    })
  })

  it('inline v-for', function () {
    el.innerHTML = '<p slot="1">1</p><p slot="2">2</p><p slot="3">3</p>'
    new Vue({
      el: el,
      template: '<div v-for="n in list"><slot :name="$index + 1"></slot></div>',
      data: {
        list: 0
      },
      beforeCompile: function () {
        this.list = this.$options._content.querySelectorAll('p').length
      }
    })
    expect(el.innerHTML).toBe('<div><p slot="1">1</p></div><div><p slot="2">2</p></div><div><p slot="3">3</p></div>')
  })

  it('v-for + component + parent directive + transclusion', function (done) {
    var vm = new Vue({
      el: el,
      template: '<test v-for="n in list" :class="cls" :a="n.a">{{msg}}</test>',
      data: {
        cls: 'parent',
        msg: 'foo',
        list: [{a: 1}, {a: 2}, {a: 3}]
      },
      components: {
        test: {
          replace: true,
          props: ['a'],
          template: '<div class="child">{{a}} <slot></slot></div>'
        }
      }
    })
    var markup = vm.list.map(function (item) {
      return '<div class="child parent">' + item.a + ' foo</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup)
    vm.msg = 'bar'
    markup = vm.list.map(function (item) {
      return '<div class="child parent">' + item.a + ' bar</div>'
    }).join('')
    nextTick(function () {
      expect(el.innerHTML).toBe(markup)
      done()
    })
  })

  it('nested transclusions', function (done) {
    vm = new Vue({
      el: el,
      template:
        '<testa>' +
          '<testb>' +
            '<div v-for="n in list">{{n}}</div>' +
          '</testb>' +
        '</testa>',
      data: {
        list: [1, 2]
      },
      components: {
        testa: { template: '<slot></slot>' },
        testb: { template: '<slot></slot>' }
      }
    })
    expect(el.innerHTML).toBe(
      '<testa><testb>' +
        '<div>1</div><div>2</div>' +
      '</testb></testa>'
    )
    vm.list.push(3)
    nextTick(function () {
      expect(el.innerHTML).toBe(
        '<testa><testb>' +
          '<div>1</div><div>2</div><div>3</div>' +
        '</testb></testa>'
      )
      done()
    })
  })

  it('nested transclusion, container dirs & props', function (done) {
    vm = new Vue({
      el: el,
      template:
        '<testa>' +
          '<testb v-if="ok" :msg="msg"></testb>' +
        '</testa>',
      data: {
        ok: false,
        msg: 'hello'
      },
      components: {
        testa: { template: '<slot></slot>' },
        testb: {
          props: ['msg'],
          template: '{{msg}}'
        }
      }
    })
    expect(el.innerHTML).toBe('<testa></testa>')
    vm.ok = true
    nextTick(function () {
      expect(el.innerHTML).toBe('<testa><testb>hello</testb></testa>')
      done()
    })
  })

  // #1010
  it('v-for inside transcluded content', function () {
    vm = new Vue({
      el: el,
      template:
        '<testa>' +
          '{{inner}} {{outer}}' +
          '<div v-for="item in list"> {{item.inner}} {{outer}}</div>' +
        '</testa>',
      data: {
        outer: 'outer',
        inner: 'parent-inner',
        list: [
          { inner: 'list-inner' }
        ]
      },
      components: {
        testa: {
          data: function () {
            return {
              inner: 'component-inner'
            }
          },
          template: '<slot></slot>'
        }
      }
    })
    expect(el.textContent).toBe('parent-inner outer list-inner outer')
  })

  it('single content outlet with replace: true', function () {
    vm = new Vue({
      el: el,
      template:
        '<test><p>1</p><p>2</p></test>',
      components: {
        test: {
          template: '<slot></slot>',
          replace: true
        }
      }
    })
    expect(el.innerHTML).toBe('<p>1</p><p>2</p>')
  })

  it('template slot', function () {
    vm = new Vue({
      el: el,
      template:
        '<test><template slot="test">hello</template></test>',
      components: {
        test: {
          template: '<slot name="test"></slot> world',
          replace: true
        }
      }
    })
    expect(el.innerHTML).toBe('hello world')
  })

  it('inside v-for', function () {
    new Vue({
      el: el,
      template: '<comp v-for="item in items">{{item.value}}</comp>',
      data: {
        items: [{value: 123}, {value: 234}]
      },
      components: {
        comp: {
          tempalte: '<div><slot></slot></div>'
        }
      }
    })
    expect(el.textContent).toBe('123234')
  })

  it('fallback inside v-for', function () {
    new Vue({
      el: el,
      template: '<div v-for="n in 3"><comp></comp></div>',
      components: {
        comp: {
          template: '<div><slot>{{foo}}</slot></div>',
          data: function () {
            return {
              foo: 'bar'
            }
          }
        }
      }
    })
    expect(el.textContent).toBe('barbarbar')
  })

  it('fallback for slot with v-if', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        ok: false,
        msg: 'inserted'
      },
      template: '<div><comp><div v-if="ok">{{ msg }}</div></comp></div>',
      components: {
        comp: {
          data: function () {
            return { msg: 'fallback' }
          },
          template: '<div><slot>{{ msg }}</slot></div>'
        }
      }
    })
    expect(el.textContent).toBe('fallback')
    vm.ok = true
    nextTick(function () {
      expect(el.textContent).toBe('inserted')
      done()
    })
  })

  // #2435
  it('slot inside template', function () {
    var vm = new Vue({
      el: el,
      template: '<test>foo</test>',
      components: {
        test: {
          data: function () {
            return { ok: true }
          },
          template:
            '<div>' +
              '<template v-if="ok">' +
                '<template v-if="ok">' +
                  '<slot>{{ msg }}</slot>' +
                '</template>' +
              '</template>' +
            '</div>'
        }
      }
    })
    expect(vm.$el.textContent).toBe('foo')
  })

  it('warn dynamic slot attribute', function () {
    new Vue({
      el: el,
      template: '<test><div :slot="1"></div></test>',
      components: {
        test: {
          template: '<div><slot></slot></div>'
        }
      }
    })
    expect('"slot" attribute must be static').toHaveBeenWarned()
  })

  it('default slot should use fallback content if has only whitespace', function () {
    new Vue({
      el: el,
      template: '<test><div slot="first">1</div> <div slot="second">2</div></test>',
      components: {
        test: {
          replace: true,
          template:
            '<div class="wrapper">' +
              '<slot name="first"><p>first slot</p></slot>' +
              '<slot><p>this is the default slot</p></slot>' +
              '<slot name="second"><p>second named slot</p></slot>' +
            '</div>'
        }
      }
    })
    expect(el.children[0].innerHTML).toBe('<div slot="first">1</div><p>this is the default slot</p><div slot="second">2</div>')
  })
})
