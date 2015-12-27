var _ = require('src/util')

describe('Util - component', function () {

  it('checkComponentAttr', function () {
    var el = document.createElement('component')

    // <component> with no is attr
    var res = _.checkComponentAttr(el)
    expect(res).toBeUndefined()

    // static <component is="...">
    el.setAttribute('is', 'what')
    res = _.checkComponentAttr(el)
    expect(res.id).toBe('what')
    expect(res.dynamic).toBeFalsy()

    // <component :is="...">
    el.setAttribute(':is', 'what')
    res = _.checkComponentAttr(el)
    expect(res.id).toBe('what')
    expect(res.dynamic).toBe(true)

    // custom element, not defined
    el = document.createElement('test')
    res = _.checkComponentAttr(el, {
      components: {}
    })
    expect(res).toBeUndefined()

    // custom element, defined
    res = _.checkComponentAttr(el, {
      components: { test: true }
    })
    expect(res.id).toBe('test')

    // is on undefined custom element
    el = document.createElement('test2')
    el.setAttribute('is', 'what')
    res = _.checkComponentAttr(el, {
      components: {}
    })
    expect(res.id).toBe('what')
  })
})
