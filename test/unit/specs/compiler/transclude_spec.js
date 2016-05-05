var transclude = require('src/compiler').transclude
var Vue = require('src')
var _ = require('src/util')

describe('Transclude', function () {
  var el, options
  beforeEach(function () {
    el = document.createElement('div')
    options = _.extend({}, Vue.options)
  })

  it('normal', function () {
    var res = transclude(el, options)
    expect(res).toBe(el)
  })

  it('template', function () {
    options.template = '{{hi}}'
    var res = transclude(el, options)
    expect(res).toBe(el)
    expect(res.innerHTML).toBe('{{hi}}')
  })

  it('template invalid', function () {
    options.template = '#non-existent-stuff'
    var res = transclude(el, options)
    expect(res).toBeUndefined()
    expect('Invalid template option').toHaveBeenWarned()
  })

  it('template replace', function () {
    el.className = 'hello'
    options.template = '<div>{{hi}}</div>'
    options.replace = true
    var res = transclude(el, options)
    expect(res).not.toBe(el)
    expect(res.tagName).toBe('DIV')
    expect(res.className).toBe('hello')
    expect(res.innerHTML).toBe('{{hi}}')
  })

  it('template replace -> fragment instance', function () {
    var res
    options.replace = true

    // multiple root
    options.template = '<div></div><div></div>'
    res = transclude(el, options)
    expect(res.nodeType).toBe(11)

    // non-element
    options.template = '{{hi}}'
    res = transclude(el, options)
    expect(res.nodeType).toBe(11)

    // single component: <component>
    options.template = '<component bind-is="hi"></component>'
    res = transclude(el, options)
    expect(res.nodeType).toBe(11)

    // single component: custom element
    options.template = '<test></test>'
    options.components = { test: {}}
    res = transclude(el, options)
    expect(res.nodeType).toBe(11)

    // single component: is
    options.template = '<div is="test"></div>'
    res = transclude(el, options)
    expect(res.nodeType).toBe(11)

    // element directive
    options.template = '<el-dir></el-dir>'
    options.elementDirectives = { 'el-dir': {}}
    res = transclude(el, options)
    expect(res.nodeType).toBe(11)

    // v-for
    options.template = '<div v-for="item in list"></div>'
    res = transclude(el, options)
    expect(res.nodeType).toBe(11)

    // v-if
    options.template = '<div v-if="ok"></div>'
    res = transclude(el, options)
    expect(res.nodeType).toBe(11)
  })

  it('direct fragment instance', function () {
    var frag = document.createDocumentFragment()
    frag.appendChild(el)
    var res = transclude(frag, options)
    expect(res).toBe(frag)
    expect(res.childNodes.length).toBe(3)
    expect(res.childNodes[0].nodeType).toBe(3)
    expect(res.childNodes[1]).toBe(el)
    expect(res.childNodes[2].nodeType).toBe(3)
  })

  it('template element', function () {
    var tpl = document.createElement('template')
    tpl.innerHTML = '<div>123</div>'
    var res = transclude(tpl, options)
    expect(res.nodeType).toBe(11)
    expect(res.childNodes.length).toBe(3)
    expect(res.childNodes[0].nodeType).toBe(3)
    expect(res.childNodes[1].textContent).toBe('123')
    expect(res.childNodes[2].nodeType).toBe(3)
  })

  it('replacer attr should overwrite container attr of same name, except class should be merged', function () {
    el.setAttribute('class', 'test other')
    el.setAttribute('title', 'parent')
    options.template = '<div class="other ok" title="child"></div>'
    options.replace = true
    options._asComponent = true
    var res = transclude(el, options)
    expect(res.getAttribute('class')).toBe('other ok test')
    expect(res.getAttribute('title')).toBe('child')
  })

  // #2789
  it('empty class merge', function () {
    el.setAttribute('class', '')
    options.template = '<div class="test"></div>'
    options.replace = true
    options._asComponent = true
    var res = transclude(el, options)
    expect(res.getAttribute('class')).toBe('test')
  })

  it('class merge for svg elements', function () {
    el.setAttribute('class', 'test')
    options.template = '<circle class="other"></circle>'
    options.replace = true
    options._asComponent = true
    var res = transclude(el, options)
    expect(res.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(res.getAttribute('class')).toBe('other test')
  })
})
