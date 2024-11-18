import Vue from 'vue'

describe('Component keep-alive', () => {
  let components, one, two, el
  beforeEach(() => {
    one = {
      template: '<div>one</div>',
      created: vi.fn(),
      mounted: vi.fn(),
      activated: vi.fn(),
      deactivated: vi.fn(),
      destroyed: vi.fn()
    }
    two = {
      template: '<div>two</div>',
      created: vi.fn(),
      mounted: vi.fn(),
      activated: vi.fn(),
      deactivated: vi.fn(),
      destroyed: vi.fn()
    }
    components = {
      one,
      two
    }
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  function assertHookCalls(component, callCounts) {
    expect([
      component.created.mock.calls.length,
      component.mounted.mock.calls.length,
      component.activated.mock.calls.length,
      component.deactivated.mock.calls.length,
      component.destroyed.mock.calls.length
    ]).toEqual(callCounts)
  }

  it('should work', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive>
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    expect(vm.$el.textContent).toBe('one')
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])
    vm.view = 'two'
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('two')
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])
      vm.view = 'one'
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('one')
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 1, 1, 0])
        vm.view = 'two'
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('two')
        assertHookCalls(one, [1, 1, 2, 2, 0])
        assertHookCalls(two, [1, 1, 2, 1, 0])
        vm.ok = false // teardown
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('')
        assertHookCalls(one, [1, 1, 2, 2, 1])
        assertHookCalls(two, [1, 1, 2, 2, 1])
      })
      .then(done)
  })

  it('should invoke hooks on the entire sub tree', done => {
    one.template = '<two/>'
    one.components = { two }

    const vm = new Vue({
      template: `
        <div>
          <keep-alive>
            <one v-if="ok"/>
          </keep-alive>
        </div>
      `,
      data: {
        ok: true
      },
      components
    }).$mount()

    expect(vm.$el.textContent).toBe('two')
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [1, 1, 1, 0, 0])
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('')
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 1, 0])
      vm.ok = true
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('two')
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 2, 1, 0])
        vm.ok = false
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('')
        assertHookCalls(one, [1, 1, 2, 2, 0])
        assertHookCalls(two, [1, 1, 2, 2, 0])
      })
      .then(done)
  })

  it('should handle nested keep-alive hooks properly', done => {
    one.template = '<keep-alive><two v-if="ok" /></keep-alive>'
    one.data = () => ({ ok: true })
    one.components = { two }

    const vm = new Vue({
      template: `
        <div>
          <keep-alive>
            <one v-if="ok" ref="one" />
          </keep-alive>
        </div>
      `,
      data: {
        ok: true
      },
      components
    }).$mount()

    const oneInstance = vm.$refs.one
    expect(vm.$el.textContent).toBe('two')
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [1, 1, 1, 0, 0])
    vm.ok = false
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('')
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 1, 0])
    })
      .then(() => {
        vm.ok = true
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('two')
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 2, 1, 0])
      })
      .then(() => {
        // toggle sub component when activated
        oneInstance.ok = false
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('')
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 2, 2, 0])
      })
      .then(() => {
        oneInstance.ok = true
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('two')
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 3, 2, 0])
      })
      .then(() => {
        vm.ok = false
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('')
        assertHookCalls(one, [1, 1, 2, 2, 0])
        assertHookCalls(two, [1, 1, 3, 3, 0])
      })
      .then(() => {
        // toggle sub component when parent is deactivated
        oneInstance.ok = false
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('')
        assertHookCalls(one, [1, 1, 2, 2, 0])
        assertHookCalls(two, [1, 1, 3, 3, 0]) // should not be affected
      })
      .then(() => {
        oneInstance.ok = true
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('')
        assertHookCalls(one, [1, 1, 2, 2, 0])
        assertHookCalls(two, [1, 1, 3, 3, 0]) // should not be affected
      })
      .then(() => {
        vm.ok = true
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('two')
        assertHookCalls(one, [1, 1, 3, 2, 0])
        assertHookCalls(two, [1, 1, 4, 3, 0])
      })
      .then(() => {
        oneInstance.ok = false
        vm.ok = false
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('')
        assertHookCalls(one, [1, 1, 3, 3, 0])
        assertHookCalls(two, [1, 1, 4, 4, 0])
      })
      .then(() => {
        vm.ok = true
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('')
        assertHookCalls(one, [1, 1, 4, 3, 0])
        assertHookCalls(two, [1, 1, 4, 4, 0]) // should remain inactive
      })
      .then(done)
  })

  function sharedAssertions(vm, done) {
    expect(vm.$el.textContent).toBe('one')
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])
    vm.view = 'two'
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('two')
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 0, 0, 0])
      vm.view = 'one'
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('one')
        assertHookCalls(one, [1, 1, 2, 1, 0])
        assertHookCalls(two, [1, 1, 0, 0, 1])
        vm.view = 'two'
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('two')
        assertHookCalls(one, [1, 1, 2, 2, 0])
        assertHookCalls(two, [2, 2, 0, 0, 1])
        vm.ok = false // teardown
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('')
        assertHookCalls(one, [1, 1, 2, 2, 1])
        assertHookCalls(two, [2, 2, 0, 0, 2])
      })
      .then(done)
  }

  it('include (string)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive include="one">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('include (regex)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive :include="/^one$/">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('include (array)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive :include="['one']">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('exclude (string)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive exclude="two">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('exclude (regex)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive :exclude="/^two$/">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('exclude (array)', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive :exclude="['two']">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('include + exclude', done => {
    const vm = new Vue({
      template: `
        <div v-if="ok">
          <keep-alive include="one,two" exclude="two">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        ok: true
      },
      components
    }).$mount()
    sharedAssertions(vm, done)
  })

  it('prune cache on include/exclude change', done => {
    const vm = new Vue({
      template: `
        <div>
          <keep-alive :include="include">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        include: 'one,two'
      },
      components
    }).$mount()

    vm.view = 'two'
    waitForUpdate(() => {
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])
      vm.include = 'two'
    })
      .then(() => {
        assertHookCalls(one, [1, 1, 1, 1, 1])
        assertHookCalls(two, [1, 1, 1, 0, 0])
        vm.view = 'one'
      })
      .then(() => {
        assertHookCalls(one, [2, 2, 1, 1, 1])
        assertHookCalls(two, [1, 1, 1, 1, 0])
      })
      .then(done)
  })

  it('prune cache on include/exclude change + view switch', done => {
    const vm = new Vue({
      template: `
        <div>
          <keep-alive :include="include">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        include: 'one,two'
      },
      components
    }).$mount()

    vm.view = 'two'
    waitForUpdate(() => {
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])
      vm.include = 'one'
      vm.view = 'one'
    })
      .then(() => {
        assertHookCalls(one, [1, 1, 2, 1, 0])
        // two should be pruned
        assertHookCalls(two, [1, 1, 1, 1, 1])
      })
      .then(done)
  })

  it('should not prune currently active instance', done => {
    const vm = new Vue({
      template: `
        <div>
          <keep-alive :include="include">
            <component :is="view"></component>
          </keep-alive>
        </div>
      `,
      data: {
        view: 'one',
        include: 'one,two'
      },
      components
    }).$mount()

    vm.include = 'two'
    waitForUpdate(() => {
      assertHookCalls(one, [1, 1, 1, 0, 0])
      assertHookCalls(two, [0, 0, 0, 0, 0])
      vm.view = 'two'
    })
      .then(() => {
        assertHookCalls(one, [1, 1, 1, 0, 1])
        assertHookCalls(two, [1, 1, 1, 0, 0])
      })
      .then(done)
  })

  // #3882
  it('deeply nested keep-alive should be destroyed properly', done => {
    one.template = `<div><keep-alive><two></two></keep-alive></div>`
    one.components = { two }
    const vm = new Vue({
      template: `<div><parent v-if="ok"></parent></div>`,
      data: { ok: true },
      components: {
        parent: {
          template: `<div><keep-alive><one></one></keep-alive></div>`,
          components: { one }
        }
      }
    }).$mount()

    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [1, 1, 1, 0, 0])

    vm.ok = false
    waitForUpdate(() => {
      assertHookCalls(one, [1, 1, 1, 1, 1])
      assertHookCalls(two, [1, 1, 1, 1, 1])
    }).then(done)
  })

  // #4237
  it('should update latest props/listeners for a re-activated component', done => {
    const one = {
      props: ['prop'],
      template: `<div>one {{ prop }}</div>`
    }
    const two = {
      props: ['prop'],
      template: `<div>two {{ prop }}</div>`
    }
    const vm = new Vue({
      data: { view: 'one', n: 1 },
      template: `
        <div>
          <keep-alive>
            <component :is="view" :prop="n"></component>
          </keep-alive>
        </div>
      `,
      components: { one, two }
    }).$mount()

    expect(vm.$el.textContent).toBe('one 1')
    vm.n++
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('one 2')
      vm.view = 'two'
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('two 2')
      })
      .then(done)
  })

  it('max', done => {
    const spyA = vi.fn()
    const spyB = vi.fn()
    const spyC = vi.fn()
    const spyAD = vi.fn()
    const spyBD = vi.fn()
    const spyCD = vi.fn()

    function assertCount(calls) {
      expect([
        spyA.mock.calls.length,
        spyAD.mock.calls.length,
        spyB.mock.calls.length,
        spyBD.mock.calls.length,
        spyC.mock.calls.length,
        spyCD.mock.calls.length
      ]).toEqual(calls)
    }

    const vm = new Vue({
      template: `
        <keep-alive max="2">
          <component :is="n"></component>
        </keep-alive>
      `,
      data: {
        n: 'aa'
      },
      components: {
        aa: {
          template: '<div>a</div>',
          created: spyA,
          destroyed: spyAD
        },
        bb: {
          template: '<div>bbb</div>',
          created: spyB,
          destroyed: spyBD
        },
        cc: {
          template: '<div>ccc</div>',
          created: spyC,
          destroyed: spyCD
        }
      }
    }).$mount()

    assertCount([1, 0, 0, 0, 0, 0])
    vm.n = 'bb'
    waitForUpdate(() => {
      assertCount([1, 0, 1, 0, 0, 0])
      vm.n = 'cc'
    })
      .then(() => {
        // should prune A because max cache reached
        assertCount([1, 1, 1, 0, 1, 0])
        vm.n = 'bb'
      })
      .then(() => {
        // B should be reused, and made latest
        assertCount([1, 1, 1, 0, 1, 0])
        vm.n = 'aa'
      })
      .then(() => {
        // C should be pruned because B was used last so C is the oldest cached
        assertCount([2, 1, 1, 0, 1, 1])
      })
      .then(done)
  })

  it('max=1', done => {
    const spyA = vi.fn()
    const spyB = vi.fn()
    const spyC = vi.fn()
    const spyAD = vi.fn()
    const spyBD = vi.fn()
    const spyCD = vi.fn()

    function assertCount(calls) {
      expect([
        spyA.mock.calls.length,
        spyAD.mock.calls.length,
        spyB.mock.calls.length,
        spyBD.mock.calls.length,
        spyC.mock.calls.length,
        spyCD.mock.calls.length
      ]).toEqual(calls)
    }

    const vm = new Vue({
      template: `
        <keep-alive max="1">
          <component :is="n"></component>
        </keep-alive>
      `,
      data: {
        n: 'aa'
      },
      components: {
        aa: {
          template: '<div>a</div>',
          created: spyA,
          destroyed: spyAD
        },
        bb: {
          template: '<div>bbb</div>',
          created: spyB,
          destroyed: spyBD
        },
        cc: {
          template: '<div>ccc</div>',
          created: spyC,
          destroyed: spyCD
        }
      }
    }).$mount()

    assertCount([1, 0, 0, 0, 0, 0])
    vm.n = 'bb'
    waitForUpdate(() => {
      // should prune A because max cache reached
      assertCount([1, 1, 1, 0, 0, 0])
      vm.n = 'cc'
    })
      .then(() => {
        // should prune B because max cache reached
        assertCount([1, 1, 1, 1, 1, 0])
        vm.n = 'bb'
      })
      .then(() => {
        // B is recreated
        assertCount([1, 1, 2, 1, 1, 1])
        vm.n = 'aa'
      })
      .then(() => {
        // B is destroyed and A recreated
        assertCount([2, 1, 2, 2, 1, 1])
      })
      .then(done)
  })

  it('max change', done => {
    const spyA = vi.fn()
    const spyB = vi.fn()
    const spyC = vi.fn()
    const spyAD = vi.fn()
    const spyBD = vi.fn()
    const spyCD = vi.fn()

    function assertCount(calls) {
      expect([
        spyA.mock.calls.length,
        spyAD.mock.calls.length,
        spyB.mock.calls.length,
        spyBD.mock.calls.length,
        spyC.mock.calls.length,
        spyCD.mock.calls.length
      ]).toEqual(calls)
    }

    const vm = new Vue({
      template: `
        <keep-alive :max="max">
          <component :is="n"></component>
        </keep-alive>
      `,
      data: {
        n: 'aa',
        max: 2
      },
      components: {
        aa: {
          template: '<div>a</div>',
          created: spyA,
          destroyed: spyAD
        },
        bb: {
          template: '<div>bbb</div>',
          created: spyB,
          destroyed: spyBD
        },
        cc: {
          template: '<div>ccc</div>',
          created: spyC,
          destroyed: spyCD
        }
      }
    }).$mount()

    assertCount([1, 0, 0, 0, 0, 0])
    vm.n = 'bb'
    waitForUpdate(() => {
      assertCount([1, 0, 1, 0, 0, 0])
      vm.n = 'cc'
    })
      .then(() => {
        // should prune A because max cache reached
        assertCount([1, 1, 1, 0, 1, 0])
        vm.max = 1
      })
      .then(() => {
        // should prune B because max cache reached
        assertCount([1, 1, 1, 1, 1, 0])
        vm.n = 'bb'
      })
      .then(() => {
        // should prune C because max cache reached
        assertCount([1, 1, 2, 1, 1, 1])
        vm.n = 'aa'
      })
      .then(() => {
        // should prune B because max cache reached
        assertCount([2, 1, 2, 2, 1, 1])
      })
      .then(done)
  })

  it('should warn unknown component inside', () => {
    new Vue({
      template: `<keep-alive><foo/></keep-alive>`
    }).$mount()
    expect(`Unknown custom element: <foo>`).toHaveBeenWarned()
  })

  // #6938
  it('should not cache anonymous component when include is specified', done => {
    const Foo = {
      name: 'foo',
      template: `<div>foo</div>`,
      created: vi.fn()
    }

    const Bar = {
      template: `<div>bar</div>`,
      created: vi.fn()
    }

    const Child = {
      functional: true,
      render(h, ctx) {
        return h(ctx.props.view ? Foo : Bar)
      }
    }

    const vm = new Vue({
      template: `
        <keep-alive include="foo">
          <child :view="view"></child>
        </keep-alive>
      `,
      data: {
        view: true
      },
      components: { Child }
    }).$mount()

    function assert(foo, bar) {
      expect(Foo.created.mock.calls.length).toBe(foo)
      expect(Bar.created.mock.calls.length).toBe(bar)
    }

    expect(vm.$el.textContent).toBe('foo')
    assert(1, 0)
    vm.view = false
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('bar')
      assert(1, 1)
      vm.view = true
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('foo')
        assert(1, 1)
        vm.view = false
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('bar')
        assert(1, 2)
      })
      .then(done)
  })

  it('should cache anonymous components if include is not specified', done => {
    const Foo = {
      template: `<div>foo</div>`,
      created: vi.fn()
    }

    const Bar = {
      template: `<div>bar</div>`,
      created: vi.fn()
    }

    const Child = {
      functional: true,
      render(h, ctx) {
        return h(ctx.props.view ? Foo : Bar)
      }
    }

    const vm = new Vue({
      template: `
        <keep-alive>
          <child :view="view"></child>
        </keep-alive>
      `,
      data: {
        view: true
      },
      components: { Child }
    }).$mount()

    function assert(foo, bar) {
      expect(Foo.created.mock.calls.length).toBe(foo)
      expect(Bar.created.mock.calls.length).toBe(bar)
    }

    expect(vm.$el.textContent).toBe('foo')
    assert(1, 0)
    vm.view = false
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('bar')
      assert(1, 1)
      vm.view = true
    })
      .then(() => {
        expect(vm.$el.textContent).toBe('foo')
        assert(1, 1)
        vm.view = false
      })
      .then(() => {
        expect(vm.$el.textContent).toBe('bar')
        assert(1, 1)
      })
      .then(done)
  })

  // #7105
  it('should not destroy active instance when pruning cache', done => {
    const Foo = {
      template: `<div>foo</div>`,
      destroyed: vi.fn()
    }
    const vm = new Vue({
      template: `
        <div>
          <keep-alive :include="include">
            <foo/>
          </keep-alive>
        </div>
      `,
      data: {
        include: ['foo']
      },
      components: { Foo }
    }).$mount()
    // condition: a render where a previous component is reused
    vm.include = ['foo']
    waitForUpdate(() => {
      vm.include = ['']
    })
      .then(() => {
        expect(Foo.destroyed).not.toHaveBeenCalled()
      })
      .then(done)
  })
})
