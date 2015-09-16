var _ = require('../../../../src/util')

describe('Util - component', function () {

  it('checkComponent', function () {
    var el = document.createElement('component')

    // <component> with no is attr
    var res = _.checkComponent(el)
    expect(res).toBeUndefined()

    // static <component is="...">
    el.setAttribute('is', 'what')
    res = _.checkComponent(el)
    expect(res.id).toBe('what')
    expect(res.dynamic).toBeFalsy()

    // <component :is="...">
    el.setAttribute(':is', 'what')
    res = _.checkComponent(el)
    expect(res.id).toBe('what')
    expect(res.dynamic).toBe(true)

    // custom element, not defined
    el = document.createElement('test')
    res = _.checkComponent(el, {
      components: {}
    })
    expect(res).toBeUndefined()

    // custom element, defined
    res = _.checkComponent(el, {
      components: { test: true }
    })
    expect(res.id).toBe('test')

    // is on undefined custom element
    el = document.createElement('test2')
    el.setAttribute('is', 'what')
    res = _.checkComponent(el, {
      components: {}
    })
    expect(res.id).toBe('what')
  })
})
