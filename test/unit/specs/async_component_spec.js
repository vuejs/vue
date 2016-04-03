var Vue = require('src')
var _ = Vue.util

describe('Async components', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  afterEach(function () {
    document.body.removeChild(el)
  })

  it('normal', function (done) {
    var go = jasmine.createSpy()
    new Vue({
      el: el,
      template: '<test foo="bar" @ready="go"></test>',
      methods: {
        go: go
      },
      components: {
        test: function (resolve) {
          setTimeout(function () {
            resolve({
              props: ['foo'],
              template: '{{ foo }}',
              ready: function () {
                this.$emit('ready')
              }
            })
            next()
          }, 0)
        }
      }
    })
    function next () {
      expect(el.textContent).toBe('bar')
      expect(go).toHaveBeenCalled()
      done()
    }
  })

  it('dynamic', function (done) {
    var vm = new Vue({
      el: el,
      template: '<component :is="view"></component>',
      data: {
        view: 'view-a'
      },
      components: {
        'view-a': function (resolve) {
          setTimeout(function () {
            resolve({
              template: 'A'
            })
            step1()
          }, 0)
        },
        'view-b': function (resolve) {
          setTimeout(function () {
            resolve({
              template: 'B'
            })
            step2()
          }, 0)
        }
      }
    })
    var aCalled = false
    function step1 () {
      // ensure A is resolved only once
      expect(aCalled).toBe(false)
      aCalled = true
      expect(el.textContent).toBe('A')
      vm.view = 'view-b'
    }
    function step2 () {
      expect(el.textContent).toBe('B')
      vm.view = 'view-a'
      _.nextTick(function () {
        expect(el.textContent).toBe('A')
        done()
      })
    }
  })

  it('invalidate pending on dynamic switch', function (done) {
    var vm = new Vue({
      el: el,
      template: '<component :is="view"></component>',
      data: {
        view: 'view-a'
      },
      components: {
        'view-a': function (resolve) {
          setTimeout(function () {
            resolve({
              template: 'A'
            })
            step1()
          }, 100)
        },
        'view-b': function (resolve) {
          setTimeout(function () {
            resolve({
              template: 'B'
            })
            step2()
          }, 200)
        }
      }
    })
    expect(el.textContent).toBe('')
    vm.view = 'view-b'
    function step1 () {
      // called after A resolves, but A should have been
      // invalidated so no Ctor should be set
      expect(vm._directives[0].Component).toBe(null)
    }
    function step2 () {
      // B should resolve successfully
      expect(el.textContent).toBe('B')
      done()
    }
  })

  it('invalidate pending on teardown', function (done) {
    var vm = new Vue({
      el: el,
      template: '<test></test>',
      data: {
        view: 'view-a'
      },
      components: {
        test: function (resolve) {
          setTimeout(function () {
            resolve({
              template: 'A'
            })
            next()
          }, 100)
        }
      }
    })
    expect(el.textContent).toBe('')
    // cache directive isntance before destroy
    var dir = vm._directives[0]
    vm.$destroy()
    function next () {
      // called after A resolves, but A should have been
      // invalidated so no Ctor should be set
      expect(dir.Component).toBe(null)
      done()
    }
  })

  it('avoid duplicate requests', function (done) {
    var factoryCallCount = 0
    var instanceCount = 0
    new Vue({
      el: el,
      template:
        '<test></test>' +
        '<test></test>',
      components: {
        test: factory
      }
    })
    function factory (resolve) {
      factoryCallCount++
      setTimeout(function () {
        resolve({
          template: 'A',
          created: function () {
            instanceCount++
          }
        })
        next()
      }, 0)
    }
    function next () {
      expect(factoryCallCount).toBe(1)
      expect(el.textContent).toBe('AA')
      expect(instanceCount).toBe(2)
      done()
    }
  })

  it('warn reject', function () {
    new Vue({
      el: el,
      template: '<test></test>',
      components: {
        test: function (resolve, reject) {
          reject('nooooo')
        }
      }
    })
    expect('Reason: nooooo').toHaveBeenWarned()
  })

  it('v-for', function (done) {
    new Vue({
      el: el,
      template: '<test v-for="n in list" :n="n"></test>',
      data: {
        list: [1, 2, 3]
      },
      components: {
        test: function (resolve) {
          setTimeout(function () {
            resolve({
              props: ['n'],
              template: '{{n}}'
            })
            next()
          }, 0)
        }
      }
    })
    function next () {
      expect(el.textContent).toBe('123')
      done()
    }
  })
})
