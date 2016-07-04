var _ = require('src/util')
var def = require('src/directives/public/bind')
var xlinkNS = 'http://www.w3.org/1999/xlink'

describe('v-bind', function () {
  var el, dir
  beforeEach(function () {
    el = document.createElement('div')
    dir = {
      el: el,
      descriptor: {},
      modifiers: {}
    }
    _.extend(dir, def)
  })

  it('normal attr', function () {
    dir.arg = 'test'
    dir.update('ok')
    expect(el.getAttribute('test')).toBe('ok')
    dir.update('again')
    expect(el.getAttribute('test')).toBe('again')
    dir.update(null)
    expect(el.hasAttribute('test')).toBe(false)
    dir.update(false)
    expect(el.hasAttribute('test')).toBe(false)
    dir.update(true)
    expect(el.getAttribute('test')).toBe('')
    dir.update(0)
    expect(el.getAttribute('test')).toBe('0')
  })

  it('should set property for input value', function () {
    dir.el = document.createElement('input')
    dir.arg = 'value'
    dir.update('foo')
    expect(dir.el.value).toBe('foo')
    dir.el = document.createElement('input')
    dir.el.type = 'checkbox'
    dir.arg = 'checked'
    expect(dir.el.checked).toBe(false)
    dir.update(true)
    expect(dir.el.checked).toBe(true)
  })

  it('xlink', function () {
    dir.arg = 'xlink:special'
    dir.update('ok')
    expect(el.getAttributeNS(xlinkNS, 'special')).toBe('ok')
    dir.update('again')
    expect(el.getAttributeNS(xlinkNS, 'special')).toBe('again')
    dir.update(null)
    expect(el.hasAttributeNS(xlinkNS, 'special')).toBe(false)
  })

  it('object format', function () {
    dir.el = document.createElement('input')
    dir.update({
      'test': 'foo',
      'value': 'bar'
    })
    expect(dir.el.getAttribute('test')).toBe('foo')
    expect(dir.el.value).toBe('bar')
    dir.update({
      'xlink:special': 'ok'
    })
    expect(dir.el.hasAttribute('test')).toBe(false)
    expect(dir.el.value).toBeFalsy()
    expect(dir.el.getAttributeNS(xlinkNS, 'special')).toBe('ok')
    dir.update(null)
    expect(dir.el.hasAttributeNS(xlinkNS, 'special')).toBe(false)
  })

  it('camel modifier', function () {
    dir.modifiers.camel = true
    var div = document.createElement('div')
    div.innerHTML = '<svg></svg>'
    dir.el = div.children[0]
    dir.arg = 'view-box'
    dir.update('0 0 1500 1000')
    expect(dir.el.getAttribute('viewBox')).toBe('0 0 1500 1000')
  })

  it('enumrated non-boolean attributes', function () {
    ['draggable', 'contenteditable', 'spellcheck'].forEach(function (attr) {
      dir.arg = attr
      dir.update(true)
      expect(el.getAttribute(attr)).toBe('true')
      dir.update(false)
      expect(el.getAttribute(attr)).toBe('false')
    })
  })
})
