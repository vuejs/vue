var transclude = require('../../../../src/compiler/transclude')
var _ = require('../../../../src/util')

if (_.inBrowser) {
  describe('Transclude', function () {

    var el, options
    beforeEach(function () {
      el = document.createElement('div')
      options = {}
      spyOn(_, 'warn')
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
      expect(_.warn).toHaveBeenCalled()
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

    it('block instance', function () {
      var frag = document.createDocumentFragment()
      frag.appendChild(el)
      var res = transclude(frag, options)
      expect(res).toBe(frag)
      expect(res.childNodes.length).toBe(3)
      expect(res.childNodes[0].nodeType).toBe(8)
      expect(res.childNodes[1]).toBe(el)
      expect(res.childNodes[2].nodeType).toBe(8)
    })

    it('template element', function () {
      var tpl = document.createElement('template')
      tpl.innerHTML = '<div>123</div>'
      var res = transclude(tpl, options)
      expect(res instanceof DocumentFragment).toBe(true)
      expect(res.childNodes.length).toBe(3)
      expect(res.childNodes[0].nodeType).toBe(8)
      expect(res.childNodes[1].textContent).toBe('123')
      expect(res.childNodes[2].nodeType).toBe(8)
    })

    it('content transclusion', function () {
      el.innerHTML = '<p>hi</p>'
      options.template = '<div><content></content></div>'
      var res = transclude(el, options)
      expect(res.firstChild.tagName).toBe('DIV')
      expect(res.firstChild.firstChild.tagName).toBe('P')
      expect(res.firstChild.firstChild.textContent).toBe('hi')
    })

    it('fallback content', function () {
      options.template = '<content><p>fallback</p></content>'
      var res = transclude(el, options)
      expect(res.firstChild.tagName).toBe('P')
      expect(res.firstChild.textContent).toBe('fallback')
    })

    it('fallback content with multiple select', function () {
      el.innerHTML = '<p class="b">select b</p>'
      options.template = '<content select=".a"><p>fallback a</p></content><content select=".b">fallback b</content>'
      var res = transclude(el, options)
      expect(res.childNodes.length).toBe(2)
      expect(res.firstChild.textContent).toBe('fallback a')
      expect(res.lastChild.textContent).toBe('select b')
    })

    it('content transclusion with replace', function () {
      el.innerHTML = '<p>hi</p>'
      options.template = '<div><div><content></content></div></div>'
      options.replace = true
      var res = transclude(el, options)
      expect(res).not.toBe(el)
      expect(res.firstChild.tagName).toBe('DIV')
      expect(res.firstChild.firstChild.tagName).toBe('P')
      expect(res.firstChild.firstChild.textContent).toBe('hi')
    })

    it('block instance content transclusion', function () {
      el.innerHTML = '<p>hi</p><span>ho</span>'
      options.template = '<div></div><content select="p"></content><content select="span"></content>'
      options.replace = true
      var res = transclude(el, options)
      expect(res.childNodes[1].tagName).toBe('DIV')
      expect(res.childNodes[2].tagName).toBe('P')
      expect(res.childNodes[3].tagName).toBe('SPAN')
    })

    it('select should only match children', function () {
      el.innerHTML = '<p class="b">select b</p><span><p class="b">nested b</p></span><span><p class="c">nested c</p></span>'
      options.template = '<content select=".a"><p>fallback a</p></content><content select=".b">fallback b</content><content select=".c">fallback c</content>'
      var res = transclude(el, options)
      expect(res.childNodes.length).toBe(3)
      expect(res.firstChild.textContent).toBe('fallback a')
      expect(res.childNodes[1].textContent).toBe('select b')
      expect(res.lastChild.textContent).toBe('fallback c')
    })

  })
}