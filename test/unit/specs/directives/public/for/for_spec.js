var _ = require('src/util')
var Vue = require('src')

describe('v-for', function () {
  var el
  beforeEach(function () {
    el = document.createElement('div')
  })

  it('objects', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: [{a: 1}, {a: 2}]
      },
      template: '<div v-for="item in items">{{$index}} {{item.a}}</div>'
    })
    assertMutations(vm, el, done)
  })

  it('primitives', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: [1, 2, 3]
      },
      template: '<div v-for="item in items">{{$index}} {{item}}</div>'
    })
    assertPrimitiveMutations(vm, el, done)
  })

  it('object of objects', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: {
          a: {a: 1},
          b: {a: 2}
        }
      },
      template: '<div v-for="item in items">{{$index}} {{$key}} {{item.a}}</div>'
    })
    assertObjectMutations(vm, el, done)
  })

  it('object of primitives', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: {
          a: 1,
          b: 2
        }
      },
      template: '<div v-for="item in items">{{$index}} {{$key}} {{item}}</div>'
    })
    assertObjectPrimitiveMutations(vm, el, done)
  })

  it('array of arrays', function () {
    var vm = new Vue({
      el: el,
      data: {
        items: [[1, 1], [2, 2], [3, 3]]
      },
      template: '<div v-for="item in items">{{$index}} {{item}}</div>'
    })
    var markup = vm.items.map(function (item, i) {
      return '<div>' + i + ' ' + item.toString() + '</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup)
  })

  it('repeating object with filter', function () {
    new Vue({
      el: el,
      data: {
        items: {
          a: { msg: 'aaa' },
          b: { msg: 'bbb' }
        }
      },
      template: '<div v-for="item in items | filterBy \'aaa\'">{{item.msg}}</div>'
    })
    expect(el.innerHTML).toBe('<div>aaa</div>')
  })

  it('filter converting array to object', function () {
    new Vue({
      el: el,
      data: {
        items: [
          { msg: 'aaa' },
          { msg: 'bbb' }
        ]
      },
      template: '<div v-for="item in items | test">{{item.msg}} {{$key}}</div>',
      filters: {
        test: function (val) {
          return {
            a: val[0],
            b: val[1]
          }
        }
      }
    })
    expect(el.innerHTML).toBe('<div>aaa a</div><div>bbb b</div>')
  })

  it('check priorities: v-if before v-for', function () {
    new Vue({
      el: el,
      data: {
        items: [1, 2, 3]
      },
      template: '<div v-if="item < 3" v-for="item in items">{{item}}</div>'
    })
    expect(el.textContent).toBe('12')
  })

  it('check priorities: v-if after v-for', function () {
    new Vue({
      el: el,
      data: {
        items: [1, 2, 3]
      },
      template: '<div v-for="item in items" v-if="item < 3">{{item}}</div>'
    })
    expect(el.textContent).toBe('12')
  })

  it('component', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: [{a: 1}, {a: 2}]
      },
      template: '<test v-for="item in items" :index="$index" :item="item"></test>',
      components: {
        test: {
          props: ['index', 'item'],
          template: '<div>{{index}} {{item.a}}</div>',
          replace: true
        }
      }
    })
    assertMutations(vm, el, done)
  })

  it('is component', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: [{a: 1}, {a: 2}]
      },
      template: '<p v-for="item in items" is="test" :index="$index" :item="item"></p>',
      components: {
        test: {
          props: ['index', 'item'],
          template: '<div>{{index}} {{item.a}}</div>',
          replace: true
        }
      }
    })
    assertMutations(vm, el, done)
  })

  it('component with inline-template', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: [{a: 1}, {a: 2}]
      },
      template:
        '<test v-for="item in items" :index="$index" :item="item" inline-template>' +
          '{{index}} {{item.a}}' +
        '</test>',
      components: {
        test: {
          props: ['index', 'item']
        }
      }
    })
    assertMutations(vm, el, done)
  })

  it('component with primitive values', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: [1, 2, 3]
      },
      template: '<test v-for="item in items" :index="$index" :value="item"></test>',
      components: {
        test: {
          props: ['index', 'value'],
          template: '<div>{{index}} {{value}}</div>',
          replace: true
        }
      }
    })
    assertPrimitiveMutations(vm, el, done)
  })

  it('component with object of objects', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: {
          a: {a: 1},
          b: {a: 2}
        }
      },
      template: '<test v-for="item in items" :key="$key" :index="$index" :value="item"></test>',
      components: {
        test: {
          props: ['key', 'index', 'value'],
          template: '<div>{{index}} {{key}} {{value.a}}</div>',
          replace: true
        }
      }
    })
    assertObjectMutations(vm, el, done)
  })

  it('nested loops', function () {
    new Vue({
      el: el,
      data: {
        items: [
          { items: [{a: 1}, {a: 2}], a: 1 },
          { items: [{a: 3}, {a: 4}], a: 2 }
        ]
      },
      template: '<div v-for="item in items">' +
          '<p v-for="subItem in item.items">{{$index}} {{subItem.a}} {{$parent.$index}} {{item.a}}</p>' +
        '</div>'
    })
    expect(el.innerHTML).toBe(
      '<div><p>0 1 0 1</p><p>1 2 0 1</p></div>' +
      '<div><p>0 3 1 2</p><p>1 4 1 2</p></div>'
    )
  })

  it('nested loops on object', function () {
    new Vue({
      el: el,
      data: {
        listHash: {
          listA: [{a: 1}, {a: 2}],
          listB: [{a: 1}, {a: 2}]
        }
      },
      template:
        '<div v-for="list in listHash">' +
          '{{$key}}' +
          '<p v-for="item in list">{{item.a}}</p>' +
        '</div>'
    })
    function output (key) {
      var key1 = key === 'listA' ? 'listB' : 'listA'
      return '<div>' + key + '<p>1</p><p>2</p></div>' +
             '<div>' + key1 + '<p>1</p><p>2</p></div>'
    }
    expect(el.innerHTML === output('listA') || el.innerHTML === output('listB')).toBeTruthy()
  })

  it('dynamic component type based on instance data', function () {
    new Vue({
      el: el,
      template: '<component v-for="item in list" :is="\'view-\' + item.type"></component>',
      data: {
        list: [
          { type: 'a' },
          { type: 'b' },
          { type: 'c' }
        ]
      },
      components: {
        'view-a': {
          template: 'foo'
        },
        'view-b': {
          template: 'bar'
        },
        'view-c': {
          template: 'baz'
        }
      }
    })
    expect(el.innerHTML).toBe('<component>foo</component><component>bar</component><component>baz</component>')
    // primitive
    el = document.createElement('div')
    new Vue({
      el: el,
      template: '<component v-for="type in list" :is="\'view-\' + type"></component>',
      data: {
        list: ['a', 'b', 'c']
      },
      components: {
        'view-a': {
          template: 'foo'
        },
        'view-b': {
          template: 'bar'
        },
        'view-c': {
          template: 'baz'
        }
      }
    })
    expect(el.innerHTML).toBe('<component>foo</component><component>bar</component><component>baz</component>')
  })

  it('fragment loop', function (done) {
    var vm = new Vue({
      el: el,
      template: '<template v-for="item in list"><p>{{item.a}}</p><p>{{item.a + 1}}</p></template>',
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
      vm.list.splice(1, 1)
      _.nextTick(function () {
        assertMarkup()
        vm.list.splice(1, 0, { a: 2 })
        _.nextTick(function () {
          assertMarkup()
          done()
        })
      })
    })

    function assertMarkup () {
      var markup = vm.list.map(function (item) {
        return '<p>' + item.a + '</p><p>' + (item.a + 1) + '</p>'
      }).join('')
      expect(el.innerHTML).toBe(markup)
    }
  })

  it('fragment loop with component', function (done) {
    var vm = new Vue({
      el: el,
      template: '<template v-for="item in list"><test :a="item.a"></test></template>',
      data: {
        list: [
          { a: 1 },
          { a: 2 },
          { a: 3 }
        ]
      },
      components: {
        test: {
          props: ['a'],
          template: '{{a}}'
        }
      }
    })
    assertMarkup()
    vm.list.reverse()
    _.nextTick(function () {
      assertMarkup()
      vm.list.splice(1, 1)
      _.nextTick(function () {
        assertMarkup()
        vm.list.splice(1, 0, { a: 2 })
        _.nextTick(function () {
          assertMarkup()
          done()
        })
      })
    })

    function assertMarkup () {
      var markup = vm.list.map(function (item) {
        return '<test>' + item.a + '</test>'
      }).join('')
      expect(el.innerHTML).toBe(markup)
    }
  })

  it('array filters', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div v-for="item in list | filterBy filterKey | orderBy sortKey -1 | limitBy 2">{{item.id}}</div>',
      data: {
        filterKey: 'foo',
        sortKey: 'id',
        list: [
          { id: 1, id2: 4, msg: 'foo' },
          { id: 2, id2: 3, msg: 'bar' },
          { id: 3, id2: 2, msg: 'foo' },
          { id: 4, id2: 1, msg: 'bar' }
        ]
      }
    })
    assertMarkup()

    go(
      function () {
        vm.filterKey = 'bar'
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
        vm.list.push({ id: 0, id2: 4, msg: 'bar' })
      }, assertMarkup
    )
    .then(
      function () {
        vm.list = [
          { id: 33, id2: 4, msg: 'foo' },
          { id: 44, id2: 3, msg: 'bar' }
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
        })
        .slice(0, 2)
        .join('')
      expect(el.innerHTML).toBe(markup)
    }
  })

  it('orderBy supporting $key for object repeaters', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div v-for="val in obj | orderBy sortKey">{{val}}</div>',
      data: {
        sortKey: '$key',
        obj: {
          c: 1,
          a: 3,
          b: 2
        }
      }
    })
    expect(el.innerHTML).toBe('<div>3</div><div>2</div><div>1</div>')
    vm.sortKey = 'val'
    _.nextTick(function () {
      expect(el.innerHTML).toBe('<div>1</div><div>2</div><div>3</div>')
      done()
    })
  })

  it('orderBy supporting alias for primitive arrays', function () {
    new Vue({
      el: el,
      template: '<div v-for="val in list | orderBy \'val\'">{{val}}</div>',
      data: {
        list: [3, 2, 1]
      }
    })
    expect(el.innerHTML).toBe('<div>1</div><div>2</div><div>3</div>')
  })

  it('track by id', function (done) {
    var vm = new Vue({
      el: el,
      template: '<test v-for="item in list" :item="item" track-by="id"></test>',
      data: {
        list: [
          { id: 1, msg: 'foo' },
          { id: 2, msg: 'bar' },
          { id: 3, msg: 'baz' }
        ]
      },
      components: {
        test: {
          props: ['item'],
          template: '{{item.msg}}'
        }
      }
    })
    assertMarkup()
    var oldVms = vm.$children.slice()
    // swap the data with different objects, but with
    // the same ID!
    vm.list = [
      { id: 1, msg: 'qux' },
      { id: 2, msg: 'quux' }
    ]
    _.nextTick(function () {
      assertMarkup()
      // should reuse old vms!
      var i = 2
      while (i--) {
        expect(vm.$children[i]).toBe(oldVms[i])
      }
      done()
    })

    function assertMarkup () {
      var markup = vm.list.map(function (item) {
        return '<test>' + item.msg + '</test>'
      }).join('')
      expect(el.innerHTML).toBe(markup)
    }
  })

  it('track by nested id path', function (done) {
    var vm = new Vue({
      el: el,
      template: '<test v-for="item in list" :item="item" track-by="nested.id"></test>',
      data: {
        list: [
          { nested: { id: 1 }, msg: 'foo' },
          { nested: { id: 2 }, msg: 'bar' },
          { nested: { id: 3 }, msg: 'baz' }
        ]
      },
      components: {
        test: {
          props: ['item'],
          template: '{{item.msg}}'
        }
      }
    })
    assertMarkup()
    var oldVms = vm.$children.slice()
    // swap the data with different objects, but with
    // the same ID!
    vm.list = [
      { nested: { id: 1 }, msg: 'qux' },
      { nested: { id: 2 }, msg: 'quux' }
    ]
    _.nextTick(function () {
      assertMarkup()
      // should reuse old vms!
      var i = 2
      while (i--) {
        expect(vm.$children[i]).toBe(oldVms[i])
      }
      done()
    })

    function assertMarkup () {
      var markup = vm.list.map(function (item) {
        return '<test>' + item.msg + '</test>'
      }).join('')
      expect(el.innerHTML).toBe(markup)
    }
  })

  it('track by non-standard id path', function (done) {
    var vm = new Vue({
      el: el,
      template: '<test v-for="item in list" :item="item" track-by=".id"></test>',
      data: {
        list: [
          { '.id': 1, msg: 'foo' },
          { '.id': 2, msg: 'bar' },
          { '.id': 3, msg: 'baz' }
        ]
      },
      components: {
        test: {
          props: ['item'],
          template: '{{item.msg}}'
        }
      }
    })
    assertMarkup()
    var oldVms = vm.$children.slice()
    // swap the data with different objects, but with
    // the same ID!
    vm.list = [
      { '.id': 1, msg: 'qux' },
      { '.id': 2, msg: 'quux' }
    ]
    _.nextTick(function () {
      assertMarkup()
      // should reuse old vms!
      var i = 2
      while (i--) {
        expect(vm.$children[i]).toBe(oldVms[i])
      }
      done()
    })

    function assertMarkup () {
      var markup = vm.list.map(function (item) {
        return '<test>' + item.msg + '</test>'
      }).join('')
      expect(el.innerHTML).toBe(markup)
    }
  })

  it('track by $index', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: [{a: 1}, {a: 2}]
      },
      template: '<div v-for="item in items" track-by="$index">{{$index}} {{item.a}}</div>'
    })

    assertMarkup()
    var el1 = el.children[0]
    var el2 = el.children[1]
    vm.items = [{a: 3}, {a: 2}, {a: 1}]
    _.nextTick(function () {
      assertMarkup()
      // should mutate the DOM in-place
      expect(el.children[0]).toBe(el1)
      expect(el.children[1]).toBe(el2)
      done()
    })

    function assertMarkup () {
      expect(el.innerHTML).toBe(vm.items.map(function (item, i) {
        return '<div>' + i + ' ' + item.a + '</div>'
      }).join(''))
    }
  })

  it('primitive values track by $index', function (done) {
    var vm = new Vue({
      el: el,
      data: {
        items: [1, 2, 3]
      },
      template: '<div v-for="item in items" track-by="$index">{{$index}} {{item}}</div>'
    })
    assertPrimitiveMutationsWithDuplicates(vm, el, done)
  })

  it('warn missing alias', function () {
    new Vue({
      el: el,
      template: '<div v-for="items"></div>'
    })
    expect('alias is required').toHaveBeenWarned()
  })

  it('warn duplicate objects', function () {
    var obj = {}
    new Vue({
      el: el,
      template: '<div v-for="item in items"></div>',
      data: {
        items: [obj, obj]
      }
    })
    expect('Duplicate value').toHaveBeenWarned()
  })

  it('warn duplicate objects on diff', function (done) {
    var obj = {}
    var vm = new Vue({
      el: el,
      template: '<div v-for="item in items"></div>',
      data: {
        items: [obj]
      }
    })
    expect(getWarnCount()).toBe(0)
    vm.items.push(obj)
    _.nextTick(function () {
      expect('Duplicate value').toHaveBeenWarned()
      done()
    })
  })

  it('warn duplicate trackby id', function () {
    new Vue({
      el: el,
      template: '<div v-for="item in items" track-by="id"></div>',
      data: {
        items: [{id: 1}, {id: 1}]
      }
    })
    expect('Duplicate value').toHaveBeenWarned()
  })

  it('key val syntax with object', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div v-for="(key,val) in items">{{$index}} {{key}} {{val.a}}</div>',
      data: {
        items: {
          a: {a: 1},
          b: {a: 2}
        }
      }
    })
    assertObjectMutations(vm, el, done)
  })

  it('key val syntax with array', function (done) {
    var vm = new Vue({
      el: el,
      template: '<div v-for="(i, item) in items">{{i}} {{item.a}}</div>',
      data: {
        items: [{a: 1}, {a: 2}]
      }
    })
    assertMutations(vm, el, done)
  })

  it('key val syntax with nested v-for s', function () {
    new Vue({
      el: el,
      template: '<div v-for="(key,val) in items"><div v-for="(subkey,subval) in val">{{key}} {{subkey}} {{subval}}</div></div>',
      data: {
        items: {'a': {'b': 'c'}}
      }
    })
    expect(el.innerHTML).toBe('<div><div>a b c</div></div>')
  })

  it('repeat number', function () {
    new Vue({
      el: el,
      template: '<div v-for="n in 3">{{$index}} {{n}}</div>'
    })
    expect(el.innerHTML).toBe('<div>0 0</div><div>1 1</div><div>2 2</div>')
  })

  it('repeat string', function () {
    new Vue({
      el: el,
      template: '<div v-for="letter in \'vue\'">{{$index}} {{letter}}</div>'
    })
    expect(el.innerHTML).toBe('<div>0 v</div><div>1 u</div><div>2 e</div>')
  })

  it('teardown', function () {
    var vm = new Vue({
      el: el,
      template: '<div v-for="item in items"></div>',
      data: {
        items: [{a: 1}, {a: 2}]
      }
    })
    vm._directives[0].unbind()
    expect(vm.$children.length).toBe(0)
  })

  it('with transition', function (done) {
    document.body.appendChild(el)
    var vm = new Vue({
      el: el,
      template: '<div v-for="item in items" transition="test">{{item.a}}</div>',
      data: {
        items: [{a: 1}, {a: 2}, {a: 3}]
      },
      transitions: {
        test: {
          leave: function (el, done) {
            setTimeout(done, 0)
          }
        }
      }
    })
    vm.items.splice(1, 1, {a: 4})
    setTimeout(function () {
      expect(el.innerHTML).toBe(
        '<div class="test-transition">1</div>' +
        '<div class="test-transition">4</div>' +
        '<div class="test-transition">3</div>'
      )
      document.body.removeChild(el)
      done()
    }, 100)
  })

  it('v-model binding on alias', function () {
    var vm = new Vue({
      el: el,
      template:
        '<div v-for="val in items"><input v-model="val"></div>' +
        '<div v-for="val in obj"><input v-model="val"></div>',
      data: {
        items: ['a'],
        obj: { foo: 'a' }
      }
    })

    var a = getInput(1)
    a.value = 'b'
    trigger(a, 'input')
    expect(vm.items[0]).toBe('b')

    var b = getInput(2)
    b.value = 'bar'
    trigger(b, 'input')
    expect(vm.obj.foo).toBe('bar')

    function getInput (x) {
      return vm.$el.querySelector('div:nth-child(' + x + ') input')
    }
  })

  it('warn v-model on alias with filters', function () {
    var vm = new Vue({
      el: el,
      template:
        '<div v-for="item in items | orderBy \'item\'">' +
          '<input v-model="item">' +
        '</div>',
      data: {
        items: ['a', 'b']
      }
    })
    trigger(vm.$el.querySelector('input'), 'input')
    expect('It seems you are using two-way binding').toHaveBeenWarned()
  })

  it('nested track by', function (done) {
    var vm = new Vue({
      el: el,
      template:
        '<div v-for="item in list" track-by="id">' +
          '{{item.msg}}' +
          '<div v-for="subItem in item.list" track-by="id">' +
            '{{subItem.msg}}' +
          '</div>' +
        '</div>',
      data: {
        list: [
          { id: 1, msg: 'hi', list: [
            { id: 1, msg: 'hi foo' }
          ] },
          { id: 2, msg: 'bar', list: [] },
          { id: 3, msg: 'baz', list: [] }
        ]
      }
    })
    assertMarkup()

    var oldNodes = el.children
    var oldInnerNodes = el.children[0].children

    vm.list = [
      { id: 1, msg: 'baz', list: [
        { id: 1, msg: 'hi foo' },
        { id: 2, msg: 'hi bar' }
      ] },
      { id: 2, msg: 'qux', list: [] }
    ]

    _.nextTick(function () {
      assertMarkup()
      // should reuse old frags!
      var i = 2
      while (i--) {
        expect(el.children[i]).toBe(oldNodes[i])
      }
      expect(el.children[0].children[0]).toBe(oldInnerNodes[0])
      done()
    })

    function assertMarkup () {
      var markup = vm.list.map(function (item) {
        var sublist = item.list.map(function (item) {
          return '<div>' + item.msg + '</div>'
        }).join('')
        return '<div>' + item.msg + sublist + '</div>'
      }).join('')
      expect(el.innerHTML).toBe(markup)
    }
  })

  it('switch between object-converted & array mode', function (done) {
    var obj = {
      a: { msg: 'foo' },
      b: { msg: 'bar' }
    }
    var arr = [obj.b, obj.a]
    var vm = new Vue({
      el: el,
      template: '<div v-for="item in obj">{{item.msg}}</div>',
      data: {
        obj: obj
      }
    })
    expect(el.innerHTML).toBe(Object.keys(obj).map(function (key) {
      return '<div>' + obj[key].msg + '</div>'
    }).join(''))
    vm.obj = arr
    _.nextTick(function () {
      expect(el.innerHTML).toBe('<div>bar</div><div>foo</div>')
      // make sure it cleared the cache
      expect(vm._directives[0].cache.a).toBeNull()
      expect(vm._directives[0].cache.b).toBeNull()
      done()
    })
  })

  it('call attach/detach for contained components', function (done) {
    document.body.appendChild(el)
    var attachSpy = jasmine.createSpy('attach')
    var detachSpy = jasmine.createSpy('detach')
    var vm = new Vue({
      el: el,
      template: '<test v-for="item in items"></test>',
      data: {
        items: [1, 2]
      },
      components: {
        test: {
          attached: attachSpy,
          detached: detachSpy
        }
      }
    })
    expect(attachSpy.calls.count()).toBe(2)
    expect(detachSpy.calls.count()).toBe(0)
    vm.items.push(3)
    _.nextTick(function () {
      expect(attachSpy.calls.count()).toBe(3)
      expect(detachSpy.calls.count()).toBe(0)
      vm.items.pop()
      _.nextTick(function () {
        expect(attachSpy.calls.count()).toBe(3)
        expect(detachSpy.calls.count()).toBe(1)
        vm.items = []
        _.nextTick(function () {
          expect(attachSpy.calls.count()).toBe(3)
          expect(detachSpy.calls.count()).toBe(3)
          done()
        })
      })
    })
  })

  it('access parent\'s $refs', function () {
    var vm = new Vue({
      el: document.createElement('div'),
      template: '<c1 v-ref:c1><div v-for="n in 2">{{$refs.c1.d}}</div></c1>',
      components: {
        c1: {
          template: '<div><slot></slot></div>',
          data: function () {
            return {
              d: 1
            }
          }
        }
      }
    })
    expect(vm.$refs.c1 instanceof Vue).toBe(true)
    expect(vm.$refs.c1.$el.innerHTML).toContain('<div>1</div><div>1</div>')
  })

  it('access parent scope\'s $els', function (done) {
    var vm = new Vue({
      el: document.createElement('div'),
      template: '<div data-d=1 v-el:a><div v-for="n in 2">{{ready ? $els.a.getAttribute("data-d") : 0}}</div></div>',
      data: {
        ready: false
      }
    })
    expect(vm.$els.a.nodeType).toBe(1)
    expect(vm.$els.a.innerHTML).toContain('<div>0</div><div>0</div>')
    vm.ready = true
    vm.$nextTick(function () {
      expect(vm.$els.a.innerHTML).toContain('<div>1</div><div>1</div>')
      done()
    })
  })

  it('warning for frozen objects', function () {
    new Vue({
      el: document.createElement('div'),
      template: '<div v-for="item in items">{{item.name}}</div>',
      data: {
        items: [Object.freeze({ name: 'hi' })]
      }
    })
    expect('Frozen v-for objects cannot be automatically tracked').toHaveBeenWarned()
  })
})

/**
 * Simple helper for chained async asssertions
 *
 * @param {Function} fn - the data manipulation function
 * @param {Function} cb - the assertion fn to be called on nextTick
 */

function go (fn, cb) {
  return {
    stack: [{fn: fn, cb: cb}],
    then: function (fn, cb) {
      this.stack.push({fn: fn, cb: cb})
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
 * Assert mutation and markup correctness for v-for on
 * an Array of Objects
 */

function assertMutations (vm, el, done) {
  assertMarkup()
  var poppedItem
  go(
    function () {
      vm.items.push({a: 3})
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items.push(vm.items.shift())
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
      vm.items.splice(1, 1, {a: 5})
    },
    assertMarkup
  )
  // test swapping the array
  .then(
    function () {
      vm.items = [{a: 0}, {a: 1}, {a: 2}]
    },
    assertMarkup
  )
  .run(done)

  function assertMarkup () {
    var tag = el.children[0].tagName.toLowerCase()
    var markup = vm.items.map(function (item, i) {
      var el = '<' + tag + '>' + i + ' ' + item.a + '</' + tag + '>'
      return el
    }).join('')
    expect(el.innerHTML).toBe(markup)
  }
}

/**
 * Assert mutation and markup correctness for v-for on
 * an Array of primitive values
 */

function assertPrimitiveMutations (vm, el, done) {
  assertMarkup()
  go(
    function () {
      vm.items.push(4)
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
      vm.items.unshift(1)
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
      vm.items = [1, 2, 3]
    },
    assertMarkup
  )
  .run(done)

  function assertMarkup () {
    var markup = vm.items.map(function (item, i) {
      return '<div>' + i + ' ' + item + '</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup)
  }
}

/**
 * Assert mutation and markup correctness for v-for on
 * an Array of primitive values when using track-by="$index"
 */

function assertPrimitiveMutationsWithDuplicates (vm, el, done) {
  assertMarkup()
  go(
    function () {
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
    expect(el.innerHTML).toBe(markup)
  }
}

/**
 * Assert mutation and markup correctness for v-for on
 * an Object of Objects
 */

function assertObjectMutations (vm, el, done) {
  assertMarkup()
  go(
    function () {
      vm.items.a = {a: 3}
    },
    assertMarkup
  )
  .then(
    function () {
      vm.items = {
        c: {a: 1},
        d: {a: 2}
      }
    },
    assertMarkup
  )
  .then(
    function () {
      _.set(vm.items, 'a', {a: 3})
    },
    assertMarkup
  )
  .run(done)

  function assertMarkup () {
    var markup = Object.keys(vm.items).map(function (key, i) {
      return '<div>' + i + ' ' + key + ' ' + vm.items[key].a + '</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup)
  }
}

/**
 * Assert mutation and markup correctness for v-for on
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
      _.set(vm.items, 'a', 3)
    },
    assertMarkup
  )
  .run(done)

  function assertMarkup () {
    var markup = Object.keys(vm.items).map(function (key, i) {
      return '<div>' + i + ' ' + key + ' ' + vm.items[key] + '</div>'
    }).join('')
    expect(el.innerHTML).toBe(markup)
  }
}

/**
 * Helper for triggering events
 */

function trigger (target, event, process) {
  var e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  if (process) process(e)
  target.dispatchEvent(e)
  return e
}
