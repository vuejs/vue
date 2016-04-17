var _ = require('src/util')
var def = require('src/directives/internal/style')
var Vue = require('src')

function checkPrefixedProp (prop) {
  var el = document.createElement('div')
  var upper = prop.charAt(0).toUpperCase() + prop.slice(1)
  if (!(prop in el.style)) {
    var prefixes = ['Webkit', 'Moz', 'ms']
    var i = prefixes.length
    while (i--) {
      if ((prefixes[i] + upper) in el.style) {
        prop = prefixes[i] + upper
      }
    }
  }
  return prop
}

describe(':style', function () {
  var el, dir
  beforeEach(function () {
    el = document.createElement('div')
    dir = { el: el }
    _.extend(dir, def)
  })

  it('plain CSS string', function () {
    dir.update('color:red;')
    expect(el.style.cssText.replace(/\s/g, '')).toBe('color:red;')
  })

  it('!important', function () {
    dir.update({
      color: 'red !important;'
    })
    expect(el.style.getPropertyPriority('color')).toBe('important')
  })

  it('camel case', function () {
    dir.update({
      marginLeft: '30px'
    })
    expect(el.style.marginLeft).toBe('30px')
  })

  it('remove on falsy value', function () {
    el.style.color = 'red'
    dir.update({
      color: null
    })
    expect(el.style.color).toBe('')
  })

  it('ignore unsupported property', function () {
    dir.update({
      unsupported: 'test'
    })
    expect(el.style.unsupported).not.toBe('test')
  })

  it('auto prefixing', function () {
    var prop = checkPrefixedProp('transform')
    var val = 'scale(0.5)'
    dir.update({
      transform: val
    })
    expect(el.style[prop]).toBe(val)
  })

  it('object with multiple fields', function () {
    el.style.padding = '10px'

    dir.update({
      color: 'red',
      marginRight: '30px'
    })
    expect(el.style.getPropertyValue('color')).toBe('red')
    expect(el.style.getPropertyValue('margin-right')).toBe('30px')
    expect(el.style.getPropertyValue('padding')).toBe('10px')

    dir.update({
      color: 'blue',
      padding: null
    })
    expect(el.style.getPropertyValue('color')).toBe('blue')
    expect(el.style.getPropertyValue('margin-right')).toBeFalsy()
    expect(el.style.getPropertyValue('padding')).toBeFalsy()

    // handle falsy value
    dir.update(null)
    expect(el.style.getPropertyValue('color')).toBeFalsy()
    expect(el.style.getPropertyValue('margin-right')).toBeFalsy()
    expect(el.style.getPropertyValue('padding')).toBeFalsy()
  })

  it('array of objects', function () {
    el.style.padding = '10px'

    dir.update([{color: 'red'}, {marginRight: '30px'}])
    expect(el.style.getPropertyValue('color')).toBe('red')
    expect(el.style.getPropertyValue('margin-right')).toBe('30px')
    expect(el.style.getPropertyValue('padding')).toBe('10px')

    dir.update([{color: 'blue'}, {padding: null}])
    expect(el.style.getPropertyValue('color')).toBe('blue')
    expect(el.style.getPropertyValue('margin-right')).toBeFalsy()
    expect(el.style.getPropertyValue('padding')).toBeFalsy()
  })

  it('updates object deep', function (done) {
    el.setAttribute(':style', 'divStyling')
    var vm = new Vue({
      el: el,
      data: {divStyling: { display: 'none' }}
    })
    expect(el.style.display).toBe('none')
    vm.divStyling.display = 'block'
    _.nextTick(function () {
      expect(el.style.display).toBe('block')
      done()
    })
  })

  // #2654
  it('background size with only one value', function () {
    dir.update({ backgroundSize: '100%' })
    expect(el.style.cssText.replace(/\s/g, '')).toMatch(/background-size:100%(auto)?;/)
  })
})
