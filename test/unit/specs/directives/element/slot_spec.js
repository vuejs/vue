var Vue = require('../../../../../src/vue')
var _ = require('../../../../../src/util')

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
    el.innerHTML = '<p>hi</p>'
    options.template = '<div><slot></slot></div>'
    mount()
    expect(el.firstChild.tagName).toBe('DIV')
    expect(el.firstChild.firstChild.tagName).toBe('P')
    expect(el.firstChild.firstChild.textContent).toBe('hi')
  })

  it('no template auto content', function () {
    el.innerHTML = '<p>hi</p>'
    options._asComponent = true
    mount()
    expect(el.firstChild.tagName).toBe('P')
    expect(el.firstChild.textContent).toBe('hi')
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

  it('selector matching multiple elements', function () {
    el.innerHTML = '<p slot="t">1</p><div></div><p slot="t">2</p>'
    options.template = '<slot name="t"></slot>'
    mount()
    expect(el.innerHTML).toBe('<p slot="t">1</p><p slot="t">2</p>')
  })

  it('default content should only render parts not selected', function () {
    el.innerHTML = '<div>hi</div><p slot="a">1</p><p slot="b">2</p>'
    options.template =
      '<slot name="a"></slot>' +
      '<slot></slot>' +
      '<slot name="b"></slot>'
    mount()
    expect(el.innerHTML).toBe('<p slot="a">1</p><div>hi</div><p slot="b">2</p>')
  })

  it('content transclusion with replace', function () {
    el.innerHTML = '<p>hi</p>'
    options.template = '<div><div><slot></slot></div></div>'
    options.replace = true
    mount()
    var res = vm.$el
    expect(res).not.toBe(el)
    expect(res.firstChild.tagName).toBe('DIV')
    expect(res.firstChild.firstChild.tagName).toBe('P')
    expect(res.firstChild.firstChild.textContent).toBe('hi')
  })

  it('block instance content transclusion', function () {
    el.innerHTML = '<p slot="p">hi</p><span slot="span">ho</span>'
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
        msg: 'hello'
      },
      template: '<test>{{msg}}</test>',
      components: {
        test: {
          template: '<slot></slot>'
        }
      }
    })
    expect(el.innerHTML).toBe('<test>hello</test>')
    vm.msg = 'what'
    _.nextTick(function () {
      expect(el.innerHTML).toBe('<test>what</test>')
      done()
    })
  })

  it('v-if with content transclusion', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        a: 1,
        show: true
      },
      template: '<test :show="show">{{a}}</test>',
      components: {
        test: {
          props: ['show'],
          template: '<div v-if="show"><slot></cotent></div>'
        }
      }
    })
    expect(el.textContent).toBe('1')
    vm.a = 2
    _.nextTick(function () {
      expect(el.textContent).toBe('2')
      vm.show = false
      _.nextTick(function () {
        expect(el.textContent).toBe('')
        vm.show = true
        vm.a = 3
        _.nextTick(function () {
          expect(el.textContent).toBe('3')
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
        msg: 'hi',
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
      return '<div class="child parent">' + item.a + ' hi</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup)
    vm.msg = 'ho'
    markup = vm.list.map(function (item) {
      return '<div class="child parent">' + item.a + ' ho</div>'
    }).join('')
    _.nextTick(function () {
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
    _.nextTick(function () {
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
    _.nextTick(function () {
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
          template: '<div><slot>{{something}}</slot></div>',
          data: function () {
            return {
              something: 'hi'
            }
          }
        }
      }
    })
    expect(el.textContent).toBe('hihihi')
  })

})
