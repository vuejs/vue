import Vue from 'vue'

describe('Directive v-for', () => {
  it('should render array of primitive values', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="item in list">{{$index}}-{{item}}</span>
        </div>
      `,
      data: {
        list: ['a', 'b', 'c']
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
    Vue.set(vm.list, 0, 'd')
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-b</span><span>2-c</span>')
      vm.list.push('d')
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-b</span><span>2-c</span><span>3-d</span>')
      vm.list.splice(1, 2)
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-d</span>')
      vm.list = ['x', 'y']
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-x</span><span>1-y</span>')
      done()
    }).catch(done)
  })

  it('should render array of object values', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="item in list">{{$index}}-{{item.value}}</span>
        </div>
      `,
      data: {
        list: [
          { value: 'a' },
          { value: 'b' },
          { value: 'c' }
        ]
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
    Vue.set(vm.list, 0, { value: 'd' })
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-b</span><span>2-c</span>')
      vm.list[0].value = 'e'
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-e</span><span>1-b</span><span>2-c</span>')
      vm.list.push({})
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-e</span><span>1-b</span><span>2-c</span><span>3-</span>')
      vm.list.splice(1, 2)
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-e</span><span>1-</span>')
      vm.list = [{ value: 'x' }, { value: 'y' }]
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-x</span><span>1-y</span>')
      done()
    }).catch(done)
  })

  it('should render an Object', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="val in obj">{{val}}-{{$key}}</span>
        </div>
      `,
      data: {
        obj: { a: 0, b: 1, c: 2 }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
    vm.obj.a = 3
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span>')
      Vue.set(vm.obj, 'd', 4)
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span><span>4-d</span>')
      Vue.delete(vm.obj, 'a')
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>1-b</span><span>2-c</span><span>4-d</span>')
      done()
    }).catch(done)
  })

  it('should render each key of data', done => {
    const vm = new Vue({
      template: `
        <div>
          <span v-for="val in $data">{{val}}-{{$key}}</span>
        </div>
      `,
      data: { a: 0, b: 1, c: 2 }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
    vm.a = 3
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span>')
      done()
    }).catch(done)
  })

  describe('alternative syntax', () => {
    it('should render array of primitive values', done => {
      const vm = new Vue({
        template: `
          <div>
            <span v-for="(i, item) in list">{{i}}-{{item}}</span>
          </div>
        `,
        data: {
          list: ['a', 'b', 'c']
        }
      }).$mount()
      expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
      Vue.set(vm.list, 0, 'd')
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-b</span><span>2-c</span>')
        vm.list.push('d')
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-b</span><span>2-c</span><span>3-d</span>')
        vm.list.splice(1, 2)
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-d</span>')
        vm.list = ['x', 'y']
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('<span>0-x</span><span>1-y</span>')
        done()
      }).catch(done)
    })

    it('should render array of object values', done => {
      const vm = new Vue({
        template: `
          <div>
            <span v-for="(i, item) in list">{{i}}-{{item.value}}</span>
          </div>
        `,
        data: {
          list: [
            { value: 'a' },
            { value: 'b' },
            { value: 'c' }
          ]
        }
      }).$mount()
      expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
      Vue.set(vm.list, 0, { value: 'd' })
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-b</span><span>2-c</span>')
        vm.list[0].value = 'e'
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('<span>0-e</span><span>1-b</span><span>2-c</span>')
        vm.list.push({})
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('<span>0-e</span><span>1-b</span><span>2-c</span><span>3-</span>')
        vm.list.splice(1, 2)
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('<span>0-e</span><span>1-</span>')
        vm.list = [{ value: 'x' }, { value: 'y' }]
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('<span>0-x</span><span>1-y</span>')
        done()
      }).catch(done)
    })

    it('should render an Object', done => {
      const vm = new Vue({
        template: `
          <div>
            <span v-for="(k, v) in obj">{{v}}-{{k}}</span>
          </div>
        `,
        data: {
          obj: { a: 0, b: 1, c: 2 }
        }
      }).$mount()
      expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
      vm.obj.a = 3
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span>')
        Vue.set(vm.obj, 'd', 4)
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span><span>4-d</span>')
        Vue.delete(vm.obj, 'a')
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('<span>1-b</span><span>2-c</span><span>4-d</span>')
        done()
      }).catch(done)
    })

    it('should render each key of data', done => {
      const vm = new Vue({
        template: `
          <div>
            <span v-for="(k, v) in $data">{{v}}-{{k}}</span>
          </div>
        `,
        data: { a: 0, b: 1, c: 2 }
      }).$mount()
      expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
      vm.a = 3
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span>')
        done()
      }).catch(done)
    })
  })

  it('check priorities: v-if before v-for', function () {
    const vm = new Vue({
      data: {
        items: [1, 2, 3]
      },
      template: '<div><div v-if="item < 3" v-for="item in items">{{item}}</div></div>'
    }).$mount()
    expect(vm.$el.textContent).toBe('12')
  })

  it('check priorities: v-if after v-for', function () {
    const vm = new Vue({
      data: {
        items: [1, 2, 3]
      },
      template: '<div><div v-for="item in items" v-if="item < 3">{{item}}</div></div>'
    }).$mount()
    expect(vm.$el.textContent).toBe('12')
  })

  it('range v-for', () => {
    const vm = new Vue({
      template: '<div><div v-for="n in 3">{{n}}</div></div>'
    }).$mount()
    expect(vm.$el.textContent).toBe('123')
  })

  it('without track-by', done => {
    const vm = new Vue({
      data: {
        items: [
          { id: 1, msg: 'a' },
          { id: 2, msg: 'b' },
          { id: 3, msg: 'c' }
        ]
      },
      template: '<div><div v-for="item in items">{{ item.msg }}</div></div>'
    }).$mount()
    expect(vm.$el.textContent).toBe('abc')
    const first = vm.$el.children[0]
    vm.items.reverse()
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('cba')
      // assert reusing DOM element in place
      expect(vm.$el.children[0]).toBe(first)
      done()
    })
  })

  it('with track-by', done => {
    const vm = new Vue({
      data: {
        items: [
          { id: 1, msg: 'a' },
          { id: 2, msg: 'b' },
          { id: 3, msg: 'c' }
        ]
      },
      template: '<div><div v-for="item in items" track-by="item.id">{{ item.msg }}</div></div>'
    }).$mount()
    expect(vm.$el.textContent).toBe('abc')
    const first = vm.$el.children[0]
    vm.items.reverse()
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('cba')
      // assert moving DOM element
      expect(vm.$el.children[0]).not.toBe(first)
      expect(vm.$el.children[2]).toBe(first)
      done()
    })
  })

  it('nested loops', () => {
    const vm = new Vue({
      data: {
        items: [
          { items: [{ a: 1 }, { a: 2 }], a: 1 },
          { items: [{ a: 3 }, { a: 4 }], a: 2 }
        ]
      },
      template:
        '<div>' +
          '<div v-for="(i, item) in items">' +
            '<p v-for="subItem in item.items">{{$index}} {{subItem.a}} {{i}} {{item.a}}</p>' +
          '</div>' +
        '</div>'
    }).$mount()
    expect(vm.$el.innerHTML).toBe(
      '<div><p>0 1 0 1</p><p>1 2 0 1</p></div>' +
      '<div><p>0 3 1 2</p><p>1 4 1 2</p></div>'
    )
  })

  it('template v-for', done => {
    const vm = new Vue({
      data: {
        list: [
          { a: 1 },
          { a: 2 },
          { a: 3 }
        ]
      },
      template:
        '<div>' +
          '<template v-for="item in list">' +
            '<p>{{item.a}}</p>' +
            '<p>{{item.a + 1}}</p>' +
          '</template>' +
        '</div>'
    }).$mount()
    assertMarkup()
    vm.list.reverse()
    waitForUpdate(() => {
      assertMarkup()
      vm.list.splice(1, 1)
    }).then(() => {
      assertMarkup()
      vm.list.splice(1, 0, { a: 2 })
      done()
    }).catch(done)

    function assertMarkup () {
      var markup = vm.list.map(function (item) {
        return '<p>' + item.a + '</p><p>' + (item.a + 1) + '</p>'
      }).join('')
      expect(vm.$el.innerHTML).toBe(markup)
    }
  })

  it('component v-for', done => {
    const vm = new Vue({
      data: {
        list: [
          { a: 1 },
          { a: 2 },
          { a: 3 }
        ]
      },
      template:
        '<div>' +
          '<test v-for="item in list" :msg="item.a">' +
            '<span>{{item.a}}</span>' +
          '</test>' +
        '</div>',
      components: {
        test: {
          props: ['msg'],
          template: '<p>{{msg}}<slot></slot></p>'
        }
      }
    }).$mount()
    assertMarkup()
    vm.list.reverse()
    waitForUpdate(() => {
      assertMarkup()
      vm.list.splice(1, 1)
    }).then(() => {
      assertMarkup()
      vm.list.splice(1, 0, { a: 2 })
      done()
    }).catch(done)

    function assertMarkup () {
      var markup = vm.list.map(function (item) {
        return `<p>${item.a}<span>${item.a}</span></p>`
      }).join('')
      expect(vm.$el.innerHTML).toBe(markup)
    }
  })

  it('dynamic component v-for', done => {
    const vm = new Vue({
      data: {
        list: [
          { type: 'one' },
          { type: 'two' }
        ]
      },
      template:
        '<div>' +
          '<component v-for="item in list" :is="item.type"></component>' +
        '</div>',
      components: {
        one: {
          template: '<p>One!</p>'
        },
        two: {
          template: '<div>Two!</div>'
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML).toContain('<p>One!</p><div>Two!</div>')
    vm.list.reverse()
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toContain('<div>Two!</div><p>One!</p>')
      done()
    }).catch(done)
  })
})
