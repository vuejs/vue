var Vue = require('../../../src/vue')
var _ = Vue.util

describe('Staggering Transitions', function () {

  var el
  var delayAmount = 50
  var multiplier = 2.5 // the bigger the slower, but safer
  beforeEach(function () {
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  afterEach(function () {
    document.body.removeChild(el)
  })

  it('as attribute', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div v-repeat="list" v-transition="stagger" stagger="' + delayAmount + '">{{a}}</div>',
      data: {
        list: []
      },
      transitions: {
        stagger: {
          enter: function (el, done) {
            _.nextTick(done)
          },
          leave: function (el, done) {
            _.nextTick(done)
          }
        }
      }
    })
    assertStagger(vm, done)
  })

  it('as hook', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div v-repeat="list" v-transition="stagger">{{a}}</div>',
      data: {
        list: []
      },
      transitions: {
        stagger: {
          stagger: function (i) {
            return i * delayAmount
          },
          enter: function (el, done) {
            _.nextTick(done)
          },
          leave: function (el, done) {
            _.nextTick(done)
          }
        }
      }
    })
    assertStagger(vm, done)
  })

  it('remove while staggered', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div v-repeat="list" v-transition="stagger" stagger="' + delayAmount + '">{{a}}</div>',
      data: {
        list: []
      },
      transitions: {
        stagger: {
          enter: function (el, done) {
            _.nextTick(done)
          },
          leave: function (el, done) {
            _.nextTick(done)
          }
        }
      }
    })
    vm.list = [{a: 1}, {a: 2}]
    expect(el.innerHTML).toBe('')
    _.nextTick(function () {
      expect(el.innerHTML).toBe('<div class="stagger-transition stagger-enter">1</div>')
      vm.list = [vm.list[0]] // remove second
      setTimeout(function () {
        // should have only one
        expect(el.innerHTML).toBe('<div class="stagger-transition">1</div>')
        done()
      }, delayAmount * multiplier)
    })
  })

  it('reorder while staggered', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div v-repeat="list" v-transition="stagger" stagger="' + delayAmount + '">{{a}}</div>',
      data: {
        list: []
      },
      transitions: {
        stagger: {
          enter: function (el, done) {
            _.nextTick(done)
          },
          leave: function (el, done) {
            _.nextTick(done)
          }
        }
      }
    })
    vm.list = [{a: 1}, {a: 2}, {a: 3}]
    expect(el.innerHTML).toBe('')
    _.nextTick(function () {
      expect(el.innerHTML).toBe('<div class="stagger-transition stagger-enter">1</div>')
      vm.list = [vm.list[2], vm.list[1], vm.list[0]] // reorder
      setTimeout(function () {
        // should have correct order
        expect(el.innerHTML).toBe(
          '<div class="stagger-transition">3</div>' +
          '<div class="stagger-transition">2</div>' +
          '<div class="stagger-transition">1</div>'
        )
        done()
      }, delayAmount * 3)
    })
  })

  function assertStagger (vm, done) {
    vm.list = [{a: 1}, {a: 2}]
    expect(el.innerHTML).toBe('')
    _.nextTick(function () {
      expect(el.innerHTML).toBe('<div class="stagger-transition stagger-enter">1</div>')
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div class="stagger-transition">1</div>')
        setTimeout(function () {
          expect(el.innerHTML).toBe(
            '<div class="stagger-transition">1</div>' +
            '<div class="stagger-transition">2</div>'
          )
          vm.list = []
          _.nextTick(function () {
            expect(el.innerHTML).toBe(
              '<div class="stagger-transition stagger-leave">1</div>' +
              '<div class="stagger-transition">2</div>'
            )
            _.nextTick(function () {
              expect(el.innerHTML).toBe('<div class="stagger-transition">2</div>')
              setTimeout(function () {
                expect(el.innerHTML).toBe('')
                done()
              }, delayAmount * multiplier)
            })
          })
        }, delayAmount * multiplier)
      })
    })
  }
})
