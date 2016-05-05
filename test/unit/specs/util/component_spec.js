var _ = require('src/util')

describe('Util - component', function () {
  it('checkComponentAttr', function () {
    var el = document.createElement('component')
    var mockOptions = { components: {
      foo: {}
    }}

    // <component> with no is attr
    var res = _.checkComponentAttr(el, mockOptions)
    expect(res).toBeUndefined()

    // static <component is="...">
    el.setAttribute('is', 'foo')
    res = _.checkComponentAttr(el, mockOptions)
    expect(res.id).toBe('foo')
    expect(res.dynamic).toBeFalsy()

    // <component :is="...">
    el.setAttribute(':is', 'foo')
    res = _.checkComponentAttr(el, mockOptions)
    expect(res.id).toBe('foo')
    expect(res.dynamic).toBe(true)

    // <test is="...">
    el = document.createElement('test')
    el.setAttribute('is', 'foo')
    res = _.checkComponentAttr(el, mockOptions)
    expect(res.id).toBe('foo')
    expect(res.dynamic).toBeUndefined()

    // <test :is="...">
    el = document.createElement('test')
    el.setAttribute(':is', 'foo')
    res = _.checkComponentAttr(el, mockOptions)
    expect(res.id).toBe('foo')
    expect(res.dynamic).toBe(true)

    // custom element, not defined
    el = document.createElement('test')
    res = _.checkComponentAttr(el, mockOptions)
    expect(res).toBeUndefined()

    // custom element, defined
    el = document.createElement('foo')
    res = _.checkComponentAttr(el, mockOptions)
    expect(res.id).toBe('foo')

    // is on undefined custom element
    // should be preserved in case it is a native custom element usage
    el = document.createElement('test2')
    el.setAttribute('is', 'bar')
    res = _.checkComponentAttr(el, mockOptions)
    expect(res).toBeUndefined()
  })
})
