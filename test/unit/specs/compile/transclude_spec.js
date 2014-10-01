var transclude = require('../../../../src/compile/transclude')
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
    })

    it('template element', function () {
      var tpl = document.createElement('template')
      tpl.innerHTML = '<div>123</div>'
      var res = transclude(tpl, options)
      expect(res instanceof DocumentFragment).toBe(true)
      expect(res.childNodes.length).toBe(1)
      expect(res.childNodes[0].textContent).toBe('123')
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
      expect(res.firstChild.tagName).toBe('DIV')
      expect(res.childNodes[1].tagName).toBe('P')
      expect(res.childNodes[2].tagName).toBe('SPAN')
    })

  })
}