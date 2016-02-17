var compile = require('src/compiler').compile
var Vue = require('src')

describe('v-cloak', function () {
  it('should not remove during compile', function () {
    var el = document.createElement('div')
    el.setAttribute('v-cloak', '')
    compile(el, Vue.options)
    expect(el.hasAttribute('v-cloak')).toBe(true)
  })

  it('should remove after compile', function () {
    var el = document.createElement('div')
    el.setAttribute('v-cloak', '')
    new Vue({
      el: el
    })
    expect(el.hasAttribute('v-cloak')).toBe(false)
  })
})
