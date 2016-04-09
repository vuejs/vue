var Vue = require('src')
var transition = require('src/transition')
var def = require('src/directives/public/show')

describe('v-show', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
    document.body.appendChild(el)
    spyOn(transition, 'applyTransition').and.callThrough()
  })

  afterEach(function () {
    document.body.removeChild(el)
  })

  it('should work', function () {
    var dir = {
      el: el,
      update: def.update,
      apply: def.apply,
      vm: new Vue()
    }
    dir.update(false)
    expect(el.style.display).toBe('none')
    dir.update(true)
    expect(el.style.display).toBe('')
    expect(transition.applyTransition).toHaveBeenCalled()
  })

  it('should work with v-else', function (done) {
    var vm = new Vue({
      el: el,
      template:
        '<p v-show="ok">YES</p>' +
        '<p v-else>NO</p>',
      data: {
        ok: true
      }
    })
    expect(el.children[0].style.display).toBe('')
    expect(el.children[1].style.display).toBe('none')
    expect(transition.applyTransition.calls.count()).toBe(2)
    vm.ok = false
    Vue.nextTick(function () {
      expect(el.children[0].style.display).toBe('none')
      expect(el.children[1].style.display).toBe('')
      expect(transition.applyTransition.calls.count()).toBe(4)
      done()
    })
  })

  it('show + else with component', function (done) {
    var vm = new Vue({
      el: el,
      data: { ok: false },
      template: '<test v-show="ok"></test><div v-else>B</div>' +
        '<test v-show="ok"></test><test2 v-else></test2>' +
        '<div v-show="ok">A</div><test2 v-else></test2>',
      components: {
        test: { template: 'A' },
        test2: { template: 'B' }
      }
    })
    expect(el.children[0].style.display).toBe('none')
    expect(el.children[1].style.display).toBe('')
    expect(el.children[2].style.display).toBe('none')
    expect(el.children[3].style.display).toBe('')
    expect(el.children[4].style.display).toBe('none')
    expect(el.children[5].style.display).toBe('')
    vm.ok = true
    Vue.nextTick(function () {
      expect(el.children[1].style.display).toBe('none')
      expect(el.children[0].style.display).toBe('')
      expect(el.children[3].style.display).toBe('none')
      expect(el.children[2].style.display).toBe('')
      expect(el.children[5].style.display).toBe('none')
      expect(el.children[4].style.display).toBe('')
      vm.ok = false
      Vue.nextTick(function () {
        expect(el.children[0].style.display).toBe('none')
        expect(el.children[1].style.display).toBe('')
        expect(el.children[2].style.display).toBe('none')
        expect(el.children[3].style.display).toBe('')
        expect(el.children[4].style.display).toBe('none')
        expect(el.children[5].style.display).toBe('')
        done()
      })
    })
  })
})
