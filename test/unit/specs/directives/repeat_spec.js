var _ = require('../../../../src/util')
var Vue = require('../../../../src/vue')

if (_.inBrowser) {
  describe('v-repeat', function () {

    var el
    beforeEach(function () {
      el = document.createElement('div')
      spyOn(_, 'warn')
    })

    it('objects', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: [{a:1}, {a:2}]
        },
        template: '<div v-repeat="items">{{$index}} {{a}}</div>'
      })
      assertMutations(vm, el, done)
    })

    it('primitive values', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: [1, 2]
        },
        template: '<div v-repeat="items">{{$index}} {{$value}}</div>'
      })
      assertPrimitiveMutations(vm, el, done)
    })

    it('objects with identifier', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: [{a:1}, {a:2}]
        },
        template: '<div v-repeat="item:items">{{$index}} {{item.a}}</div>'
      })
      assertMutations(vm, el, done)
    })

    it('primitive with identifier', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: [1, 2]
        },
        template: '<div v-repeat="item:items">{{$index}} {{item}}</div>'
      })
      assertPrimitiveMutations(vm, el, done)
    })

    it('repeating an object of objects', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: {
            a: {a:1},
            b: {a:2}
          }
        },
        template: '<div v-repeat="items">{{$index}} {{$key}} {{a}}</div>'
      })
      assertObjectMutations(vm, el, done)
    })

    it('repeating an object of primitives', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: {
            a: 1,
            b: 2
          }
        },
        template: '<div v-repeat="items">{{$index}} {{$key}} {{$value}}</div>'
      })
      assertObjectPrimitiveMutations(vm, el, done)
    })

    it('repeating an object of objects with identifier', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: {
            a: {a:1},
            b: {a:2}
          }
        },
        template: '<div v-repeat="item:items">{{$index}} {{$key}} {{item.a}}</div>'
      })
      assertObjectMutations(vm, el, done)
    })

    it('repeating an object of primitives with identifier', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: {
            a: 1,
            b: 2
          }
        },
        template: '<div v-repeat="item:items">{{$index}} {{$key}} {{item}}</div>'
      })
      assertObjectPrimitiveMutations(vm, el, done)
    })

    it('v-component', function () {
      var vm = new Vue({
        el: el,
        data: {
          items: [{a:1}, {a:2}, {a:3}]
        },
        template: '<div v-repeat="items" v-component="test"></div>',
        components: {
          test: {
            template: '<p>{{$index}} {{a}}</p>',
            replace: true
          }
        }
      })
      expect(el.innerHTML).toBe('<p>0 1</p><p>1 2</p><p>2 3</p><!--v-repeat-->')
    })

    it('nested repeats', function () {
      // body...
    })

    it('array filters', function () {
      // body...
    })

    it('trackby id', function () {
      // body...
    })

    it('warn invalid type', function () {
      // body...
    })

  })
}

/**
 * Simple helper for chained async asssertions
 *
 * @param {Function} fn - the data manipulation function
 * @param {Function} cb - the assertion fn to be called on nextTick
 */

function go (fn, cb) {
  return {
    stack: [{fn:fn, cb:cb}],
    then: function (fn, cb) {
      this.stack.push({fn:fn, cb:cb})
      return this
    },
    run: function (done) {
      var self = this
      var step = this.stack.shift()
      if (!step) return done()
      step.fn()
      _.nextTick(function () {
        step.cb()
        self.run(done)
      })
    }
  }
}

/**
 * Assert mutation and markup correctness for v-repeat on
 * an Array of Objects
 */

function assertMutations (vm, el, done) {
  assertMarkup()
  go(
    function () {
      vm.items.push({a:3})
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.shift()    
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.reverse()
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.pop()
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.unshift({a:4})
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.sort(function (a, b) {
        return a.a > b.a ? 1 : -1
      })
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.splice(1, 1, {a:5})
    },
    assertMarkup
  )
  // test swapping the array
  .then(
    function () {
      vm.items = [{a:0}, {a:1}, {a:2}]
    },
    assertMarkup
  )
  .run(done)

  function assertMarkup () {
    var markup = vm.items.map(function (item, i) {
      return '<div>' + i + ' ' + item.a + '</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
  }
}

/**
 * Assert mutation and markup correctness for v-repeat on
 * an Array of primitive values
 */

function assertPrimitiveMutations (vm, el, done) {
  assertMarkup()
  go(
    function () {
      // check duplicate
      vm.items.push(2, 3)
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.shift()    
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.reverse()
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.pop()
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.unshift(3)
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.sort(function (a, b) {
        return a > b ? 1 : -1
      })
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.splice(1, 1, 5)
    },
    assertMarkup
  )
  // test swapping the array
  .then(
    function () {
      vm.items = [1, 2, 2]
    },
    assertMarkup
  )
  .run(done)

  function assertMarkup () {
    var markup = vm.items.map(function (item, i) {
      return '<div>' + i + ' ' + item + '</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
  }
}

/**
 * Assert mutation and markup correctness for v-repeat on
 * an Object of Objects
 */

function assertObjectMutations (vm, el, done) {
  assertMarkup()
  go(
    function () {
      vm.items.a = {a:3}
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items = {
        c: {a:1},
        d: {a:2}
      }
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.$add('a', {a:3})
    },
    assertMarkup
  )
  .run(done)

  function assertMarkup () {
    var markup = Object.keys(vm.items).map(function (key, i) {
      return '<div>' + i + ' ' + key + ' ' + vm.items[key].a + '</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
  }
}

/**
 * Assert mutation and markup correctness for v-repeat on
 * an Object of primitive values
 */

function assertObjectPrimitiveMutations (vm, el, done) {
  assertMarkup()
  go(
    function () {
      vm.items.a = 3
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items = {
        c: 1,
        d: 2
      }
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.$add('a', 3)
    },
    assertMarkup
  )
  .run(done)

  function assertMarkup () {
    var markup = Object.keys(vm.items).map(function (key, i) {
      return '<div>' + i + ' ' + key + ' ' + vm.items[key] + '</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
  }
}