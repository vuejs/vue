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
          items: [2, 1, 2]
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
          items: [2, 1, 2]
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

    it('repeating object with filter', function () {
      var vm = new Vue({
        el: el,
        data: {
          items: {
            a: { msg: 'aaa' },
            b: { msg: 'bbb' }
          }
        },
        template: '<div v-repeat="items | filterBy \'aaa\'">{{msg}}</div>'
      })
      expect(el.innerHTML).toBe('<div>aaa</div><!--v-repeat-->')
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
      var vm = new Vue({
        el: el,
        data: {
          items: [
            { items: [{a:1}, {a:2}], a: 1 },
            { items: [{a:3}, {a:4}], a: 2 }
          ]
        },
        template: '<div v-repeat="items">' +
            '<p v-repeat="items">{{$index}} {{a}} {{$parent.$index}} {{$parent.a}}</p>' +
          '</div>'
      })
      expect(el.innerHTML).toBe(
        '<div><p>0 1 0 1</p><p>1 2 0 1</p><!--v-repeat--></div>' +
        '<div><p>0 3 1 2</p><p>1 4 1 2</p><!--v-repeat--></div>' +
        '<!--v-repeat-->'
      )
    })

    it('dynamic component type based on instance data', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="list" v-component="view-{{type}}"></div>',
        data: {
          list: [
            { type: 'a' },
            { type: 'b' },
            { type: 'c' }
          ]
        },
        components: {
          'view-a': {
            template: 'AAA'
          },
          'view-b': {
            template: 'BBB'
          },
          'view-c': {
            template: 'CCC'
          }
        }
      })
      expect(el.innerHTML).toBe('<div>AAA</div><div>BBB</div><div>CCC</div><!--v-repeat-->')
      // #458 meta properties
      vm = new Vue({
        el: el,
        template: '<div v-repeat="list" v-component="view-{{$value}}"></div>',
        data: {
          list: ['a', 'b', 'c']
        },
        components: {
          'view-a': {
            template: 'AAA'
          },
          'view-b': {
            template: 'BBB'
          },
          'view-c': {
            template: 'CCC'
          }
        }
      })
      expect(el.innerHTML).toBe('<div>AAA</div><div>BBB</div><div>CCC</div><!--v-repeat-->')
    })

    it('block repeat', function () {
      var vm = new Vue({
        el: el,
        template: '<template v-repeat="list"><p>{{a}}</p><p>{{a + 1}}</p></template>',
        data: {
          list: [
            { a: 1 },
            { a: 2 },
            { a: 3 }
          ]
        }
      })
      var markup = vm.list.map(function (item) {
        return '<p>' + item.a + '</p><p>' + (item.a + 1) + '</p>'
      }).join('')
      expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
    })

    it('array filters', function (done) {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="list | filterBy filterKey | orderBy sortKey -1">{{id}}</div>',
        data: {
          filterKey: 'hi!',
          sortKey: 'id',
          list: [
            { id: 1, id2: 4, msg: 'hi!' },
            { id: 2, id2: 3, msg: 'na' },
            { id: 3, id2: 2, msg: 'hi!' },
            { id: 4, id2: 1, msg: 'na' }
          ]
        }
      })
      assertMarkup()

      go(
        function () {
          vm.filterKey = 'na'
        }, assertMarkup
      )
      .then(
        function () {
          vm.sortKey = 'id2'
        }, assertMarkup
      )
      .then(
        function () {
          vm.list[0].id2 = 0
        }, assertMarkup
      )
      .then(
        function () {
          vm.list.push({ id: 0, id2: 4, msg: 'na' })
        }, assertMarkup
      )
      .then(
        function () {
          vm.list = [
            { id: 33, id2: 4, msg: 'hi!' },
            { id: 44, id2: 3, msg: 'na' }
          ]
        }, assertMarkup
      )
      .run(done)

      function assertMarkup () {
        var markup = vm.list
          .filter(function (item) {
            return item.msg === vm.filterKey
          })
          .sort(function (a, b) {
            return a[vm.sortKey] > b[vm.sortKey] ? -1 : 1
          })
          .map(function (item) {
            return '<div>' + item.id + '</div>'
          }).join('')
        expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
      }
    })

    it('trackby id', function (done) {

      assertTrackBy('<div v-repeat="list" trackby="id">{{msg}}</div>', function () {
        assertTrackBy('<div v-repeat="item:list" trackby="id">{{item.msg}}</div>', done)
      })
      
      function assertTrackBy (template, next) {
        var vm = new Vue({
          el: el,
          template: template,
          data: {
            list: [
              { id: 1, msg: 'hi' },
              { id: 2, msg: 'ha' },
              { id: 3, msg: 'ho' }
            ]
          }
        })
        assertMarkup()
        var oldVms = vm._children.slice()
        // swap the data with different objects, but with
        // the same ID!
        vm.list = [
          { id: 1, msg: 'wa' },
          { id: 2, msg: 'wo' }
        ]
        _.nextTick(function () {
          assertMarkup()
          // should reuse old vms!
          var i = 2
          while (i--) {
            expect(vm._children[i]).toBe(oldVms[i])
          }
          next()
        })

        function assertMarkup () {
          var markup = vm.list.map(function (item) {
            return '<div>' + item.msg + '</div>'
          }).join('')
          expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
        }
      }
    })

    it('warn duplicate objects', function () {
      var obj = {}
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="items"></div>',
        data: {
          items: [obj, obj]
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('warn duplicate trackby id', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="items" trackby="id"></div>',
        data: {
          items: [{id:1}, {id:1}]
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('warn v-if', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="items" v-if="aaa"></div>',
        data: {
          items: []
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('repeat number', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="3">{{$index}} {{$value}}</div>'
      })
      expect(el.innerHTML).toBe('<div>0 0</div><div>1 1</div><div>2 2</div><!--v-repeat-->')
    })

    it('repeat string', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="\'vue\'">{{$index}} {{$value}}</div>'
      })
      expect(el.innerHTML).toBe('<div>0 v</div><div>1 u</div><div>2 e</div><!--v-repeat-->')
    })

    it('teardown', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="items">{{a}}</div>',
        data: {
          items: [{a:1}, {a:2}]
        }
      })
      vm._directives[0].unbind()
      expect(vm._children.length).toBe(0)
    })

    it('with transition', function (done) {
      // === IMPORTANT ===
      // PhantomJS always returns false when calling
      // Element.contains() on a comment node. This causes
      // transitions to be skipped. Monkey patching here
      // isn't ideal but does the job...
      var inDoc = _.inDoc
      _.inDoc = function () {
        return true
      }
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="items" v-transition="test">{{a}}</div>',
        data: {
          items: [{a:1}, {a:2}, {a:3}]
        },
        transitions: {
          test: {
            leave: function (el, done) {
              setTimeout(done, 1)
            }
          }
        }
      })
      vm.items.splice(1, 1, {a:4})
      setTimeout(function () {
        expect(el.innerHTML).toBe('<div>1</div><div>4</div><div>3</div><!--v-repeat-->')
        // clean up
        _.inDoc = inDoc
        done()
      }, 30)
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
  var poppedItem
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
      poppedItem = vm.items.pop()
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.unshift(poppedItem)
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
      vm.items.push(2, 2, 3)
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