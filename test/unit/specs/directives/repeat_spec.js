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

    it('array of arrays', function () {
      var vm = new Vue({
        el: el,
        data: {
          items: [[1,1], [2,2], [3,3]]
        },
        template: '<div v-repeat="items">{{$index}} {{$value}}</div>'
      })
      var markup = vm.items.map(function (item, i) {
        return '<div>' + i + ' ' + item.toString() + '</div>'
      }).join('') + '<!--v-repeat-->'
      expect(el.innerHTML).toBe(markup)
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

    it('v-component', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: [{a:1}, {a:2}]
        },
        template: '<p v-repeat="items" v-component="test"></p>',
        components: {
          test: {
            template: '<div>{{$index}} {{a}}</div>',
            replace: true
          }
        }
      })
      assertMutations(vm, el, done)
    })

    it('v-component with inline-template', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: [{a:1}, {a:2}]
        },
        template:
          '<div v-repeat="items" v-component="test" inline-template>' +
            '{{$index}} {{a}}' +
          '</div>',
        components: {
          test: {}
        }
      })
      assertMutations(vm, el, done)
    })

    it('v-component with primitive values', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: [2, 1, 2]
        },
        template: '<p v-repeat="items" v-component="test"></p>',
        components: {
          test: {
            template: '<div>{{$index}} {{$value}}</div>',
            replace: true
          }
        }
      })
      assertPrimitiveMutations(vm, el, done)
    })

    it('v-component with object of objects', function (done) {
      var vm = new Vue({
        el: el,
        data: {
          items: {
            a: {a:1},
            b: {a:2}
          }
        },
        template: '<p v-repeat="items" v-component="test"></p>',
        components: {
          test: {
            template: '<div>{{$index}} {{$key}} {{a}}</div>',
            replace: true
          }
        }
      })
      assertObjectMutations(vm, el, done)
    })

    it('custom element component', function () {
      var vm = new Vue({
        el: el,
        data: {
          items: [{a:1}, {a:2}, {a:3}]
        },
        template: '<test-component v-repeat="items"></test-component>',
        components: {
          'test-component': {
            template: '{{$index}} {{a}}'
          }
        }
      })
      expect(el.innerHTML).toBe(
        '<test-component>0 1</test-component>' +
        '<test-component>1 2</test-component>' +
        '<test-component>2 3</test-component>' +
        '<!--v-repeat-->'
      )
    })

    it('custom element component with replace:true', function () {
      var vm = new Vue({
        el: el,
        data: {
          items: [{a:1}, {a:2}, {a:3}]
        },
        template: '<test-component v-repeat="items"></test-component>',
        components: {
          'test-component': {
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

    it('nested repeats on object', function(){
      var vm = new Vue({
        el: el,
        data: {
          listHash: {
            listA: [{a: 1},{a: 2}],
            listB: [{a: 1},{a: 2}]
          }
        },
        template: '<div v-repeat="listHash">{{$key}}' +
            '<p v-repeat="$value">{{a}}</p>' +
            '</div>'
      })
      function output(key){
        var key1 = key === 'listA' ? 'listB' : 'listA'
        return  '<div>'+ key +'<p>1</p><p>2</p><!--v-repeat--></div>' +
                '<div>'+ key1 +'<p>1</p><p>2</p><!--v-repeat--></div>' +
                '<!--v-repeat-->'
      }
      expect(el.innerHTML === output('listA') || el.innerHTML === output('listB')).toBeTruthy()
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

    it('block repeat', function (done) {
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
      assertMarkup()
      vm.list.reverse()
      _.nextTick(function () {
        assertMarkup()
        done()
      })

      function assertMarkup () {
        var markup = vm.list.map(function (item) {
          return '<!--v-start--><p>' + item.a + '</p><p>' + (item.a + 1) + '</p><!--v-end-->'
        }).join('')
        expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
      }
    })

    // added for #799
    it('block repeat with diff', function (done) {
      var vm = new Vue({
        el: el,
        template: '<template v-repeat="list" v-component="test"></template>',
        data: {
          list: [
            { a: 1 },
            { a: 2 },
            { a: 3 }
          ]
        },
        components: {
          test: {
            template: '<p>{{a}}</p><p>{{a + 1}}</p>'
          }
        }
      })
      assertMarkup()
      vm.list.reverse()
      _.nextTick(function () {
        assertMarkup()
        done()
      })

      function assertMarkup () {
        var markup = vm.list.map(function (item) {
          return '<!--v-start--><p>' + item.a + '</p><p>' + (item.a + 1) + '</p><!--v-end-->'
        }).join('')
        expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
      }
    })

    it('component + parent directive + transclusion', function (done) {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="list" v-component="test" v-class="cls">{{msg}}</div>',
        data: {
          cls: 'parent',
          msg: 'hi',
          list: [{a:1},{a:2},{a:3}]
        },
        components: {
          test: {
            replace: true,
            template: '<div class="child">{{a}} <content></content></div>'
          }
        }
      })
      var markup = vm.list.map(function (item) {
        return '<div class="child parent">' + item.a + ' hi</div>'
      }).join('')
      expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
      vm.msg = 'ho'
      markup = vm.list.map(function (item) {
        return '<div class="child parent">' + item.a + ' ho</div>'
      }).join('')
      _.nextTick(function () {
        expect(el.innerHTML).toBe(markup + '<!--v-repeat-->')
        done()
      })
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

    it('orderBy supporting $key for object repeaters', function (done) {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="obj | orderBy sortKey">{{$value}}</div>',
        data: {
          sortKey: '$key',
          obj: {
            c: 1,
            a: 3,
            b: 2
          }
        }
      })
      expect(el.innerHTML).toBe('<div>3</div><div>2</div><div>1</div><!--v-repeat-->')
      vm.sortKey = '$value'
      _.nextTick(function () {
        expect(el.innerHTML).toBe('<div>1</div><div>2</div><div>3</div><!--v-repeat-->')
        done()
      })
    })

    it('orderBy supporting $value for primitive arrays', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="list | orderBy \'$value\'">{{$value}}</div>',
        data: {
          list: [3, 2, 1]
        }
      })
      expect(el.innerHTML).toBe('<div>1</div><div>2</div><div>3</div><!--v-repeat-->')
    })

    it('track by id', function (done) {

      assertTrackBy('<div v-repeat="list" v-component="test" track-by="id"></div>', '{{msg}}', function () {
        assertTrackBy('<div v-repeat="item:list" v-component="test" track-by="id"></div>', '{{item.msg}}', done)
      })
      
      function assertTrackBy (template, componentTemplate, next) {
        var vm = new Vue({
          el: el,
          template: template,
          data: {
            list: [
              { id: 1, msg: 'hi' },
              { id: 2, msg: 'ha' },
              { id: 3, msg: 'ho' }
            ]
          },
          components: {
            test: {
              template: componentTemplate
            }
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
        template: '<div v-repeat="items" v-component="test"></div>',
        data: {
          items: [obj, obj]
        },
        components: {
          test: {}
        }
      })
      expect(_.warn).toHaveBeenCalled()
    })

    it('warn duplicate trackby id', function () {
      var vm = new Vue({
        el: el,
        template: '<div v-repeat="items" v-component="test" track-by="id"></div>',
        data: {
          items: [{id:1}, {id:1}]
        },
        components: {
          test: {}
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
        template: '<div v-repeat="items" v-component="test"></div>',
        data: {
          items: [{a:1}, {a:2}]
        },
        components: {
          test: {}
        }
      })
      vm._directives[0].unbind()
      expect(vm._children.length).toBe(0)
    })

    it('with transition', function (done) {
      document.body.appendChild(el)
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
        document.body.removeChild(el)
        done()
      }, 30)
    })

    it('sync $value changes back to original array/object', function (done) {
      var vm = new Vue({
        el: el,
        template:
          '<div v-repeat="items">{{$value}}</div>' +
          '<div v-repeat="obj">{{$value}}</div>',
        data: {
          items: ['a', 'b'],
          obj: { foo: 'a', bar: 'b' }
        }
      })
      vm._children[0].$value = 'c'
      var key = vm._children[2].$key
      vm._children[2].$value = 'd'
      _.nextTick(function () {
        expect(vm.items[0]).toBe('c')
        expect(vm.obj[key]).toBe('d')
        done()
      })
    })

    it('nested track by', function (done) {
      assertTrackBy('<div v-repeat="list" track-by="id">{{msg}}<div v-repeat="list" track-by="id">{{msg}}</div></div>', function () {
        assertTrackBy('<div v-transition v-repeat="list" track-by="id">{{msg}}<div v-transition v-repeat="list" track-by="id">{{msg}}</div></div>', done)
      })

      function assertTrackBy(template, next) {
        var vm = new Vue({
          el: el,
          data: {
            list: [
              { id: 1, msg: 'hi', list: [
                { id: 1, msg: 'hi foo' }
              ] },
              { id: 2, msg: 'ha', list: [] },
              { id: 3, msg: 'ho', list: [] }
            ]
          },
          template: template
        })
        assertMarkup()

        var oldVms = vm._children.slice()

        vm.list = [
          { id: 1, msg: 'wa', list: [
            { id: 1, msg: 'hi foo' },
            { id: 2, msg: 'hi bar' }
          ] },
          { id: 2, msg: 'wo', list: [] }
        ]

        _.nextTick(function () {
          assertMarkup()
          // should reuse old vms!
          var i = 2
          while (i--) {
            expect(vm._children[i]).toBe(oldVms[i])
          }
          expect(vm._children[0]._children[0]).toBe(oldVms[0]._children[0])
          next()
        })

        function assertMarkup () {
          var markup = vm.list.map(function (item) {
            var sublist = item.list.map(function (item) {
              return '<div>' + item.msg + '</div>'
            }).join('') + '<!--v-repeat-->'
            return '<div>' + item.msg + sublist + '</div>'
          }).join('') + '<!--v-repeat-->'
          expect(el.innerHTML).toBe(markup)
        }
      }
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