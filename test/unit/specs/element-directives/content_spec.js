var Vue = require('../../../../src/vue')
var _ = require('../../../../src/util')

describe('Content Transclusion', function () {

  var el, vm, options
  beforeEach(function () {
    el = document.createElement('div')
    options = {
      el: el
    }
  })

  function mount () {
    vm = new Vue(options)
  }

  it('no content', function () {
    options.template = '<div><content></content></div>'
    mount()
    expect(el.firstChild.childNodes.length).toBe(0)
  })

  it('default content', function () {
    el.innerHTML = '<p>hi</p>'
    options.template = '<div><content></content></div>'
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
    options.template = '<content><p>fallback</p></content>'
    mount()
    expect(el.firstChild.tagName).toBe('P')
    expect(el.firstChild.textContent).toBe('fallback')
  })

  it('fallback content with multiple select', function () {
    el.innerHTML = '<p class="b">select b</p>'
    options.template =
      '<content select=".a"><p>fallback a</p></content>' +
      '<content select=".b">fallback b</content>'
    mount()
    expect(el.childNodes.length).toBe(2)
    expect(el.firstChild.textContent).toBe('fallback a')
    expect(el.lastChild.textContent).toBe('select b')
  })

  it('selector matching multiple elements', function () {
    el.innerHTML = '<p class="t">1</p><div></div><p class="t">2</p>'
    options.template = '<content select=".t"></content>'
    mount()
    expect(el.innerHTML).toBe('<p class="t">1</p><p class="t">2</p>')
  })

  it('default content should only render parts not selected', function () {
    el.innerHTML = '<div>hi</div><p class="a">1</p><p class="b">2</p>'
    options.template =
      '<content select=".a"></content>' +
      '<content></content>' +
      '<content select=".b"></content>'
    mount()
    expect(el.innerHTML).toBe('<p class="a">1</p><div>hi</div><p class="b">2</p>')
  })

  it('content transclusion with replace', function () {
    el.innerHTML = '<p>hi</p>'
    options.template = '<div><div><content></content></div></div>'
    options.replace = true
    mount()
    var res = vm.$el
    expect(res).not.toBe(el)
    expect(res.firstChild.tagName).toBe('DIV')
    expect(res.firstChild.firstChild.tagName).toBe('P')
    expect(res.firstChild.firstChild.textContent).toBe('hi')
  })

  it('block instance content transclusion', function () {
    el.innerHTML = '<p>hi</p><span>ho</span>'
    options.template = '<div></div><content select="p"></content><content select="span"></content>'
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

  it('select should only match children', function () {
    el.innerHTML =
      '<p class="b">select b</p>' +
      '<span><p class="b">nested b</p></span>' +
      '<span><p class="c">nested c</p></span>'
    options.template =
      '<content select=".a"><p>fallback a</p></content>' +
      '<content select=".b">fallback b</content>' +
      '<content select=".c">fallback c</content>'
    mount()
    expect(el.childNodes.length).toBe(3)
    expect(el.firstChild.textContent).toBe('fallback a')
    expect(el.childNodes[1].textContent).toBe('select b')
    expect(el.lastChild.textContent).toBe('fallback c')
  })

  it('should accept expressions in selectors', function () {
    el.innerHTML = '<p>one</p><p>two</p>'
    options.template = '<content select="p:nth-child({{i}})"></content>'
    options.data = {
      i: 2
    }
    mount()
    expect(el.innerHTML).toBe('<p>two</p>')
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
          template: '<content></content>'
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
      template: '<test show="{{show}}">{{a}}</test>',
      components: {
        test: {
          props: ['show'],
          template: '<div v-if="show"><content></cotent></div>'
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

  it('inline v-repeat', function () {
    el.innerHTML = '<p>1</p><p>2</p><p>3</p>'
    new Vue({
      el: el,
      template: '<div v-repeat="list"><content select="p:nth-child({{$index + 1}})"></content></div>',
      data: {
        list: 0
      },
      beforeCompile: function () {
        this.list = this.$options._content.querySelectorAll('p').length
      }
    })
    expect(el.innerHTML).toBe('<div><p>1</p></div><div><p>2</p></div><div><p>3</p></div>')
  })

  it('v-repeat + component + parent directive + transclusion', function (done) {
    var vm = new Vue({
      el: el,
      template: '<test v-repeat="list" v-class="cls">{{msg}}</test>',
      data: {
        cls: 'parent',
        msg: 'hi',
        list: [{a: 1}, {a: 2}, {a: 3}]
      },
      components: {
        test: {
          replace: true,
          template: '<div class="child">{{a}} <content></content></div>'
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
            '<div v-repeat="list">{{$value}}</div>' +
          '</testb>' +
        '</testa>',
      data: {
        list: [1, 2]
      },
      components: {
        testa: { template: '<content></content>' },
        testb: { template: '<content></content>' }
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
          '<testb v-if="ok" prop="{{msg}}"></testb>' +
        '</testa>',
      data: {
        ok: false,
        msg: 'hello'
      },
      components: {
        testa: { template: '<content></content>' },
        testb: {
          props: ['prop'],
          template: '{{prop}}'
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
  it('v-repeat inside transcluded content', function () {
    vm = new Vue({
      el: el,
      template:
        '<testa>' +
          '{{inner}} {{outer}}' +
          '<div v-repeat="list"> {{inner}} {{outer}}</div>' +
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
          template: '<content></content>'
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
          template: '<content></content>',
          replace: true
        }
      }
    })
    expect(el.innerHTML).toBe('<p>1</p><p>2</p>')
  })

})
