import Vue from 'vue'

describe('Directive v-once', () => {
  it('should not rerender component', done => {
    const vm = new Vue({
      template: '<div v-once>{{ a }}</div>',
      data: { a: 'hello' }
    }).$mount()
    expect(vm.$el.innerHTML).toBe('hello')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('hello')
    }).then(done)
  })

  it('should not rerender self and child component', done => {
    const vm = new Vue({
      template: `<div v-once>
                  <span>{{ a }}</span>
                  <item :b="a"></item>
                </div>`,
      data: { a: 'hello' },
      components: {
        item: {
          template: '<div>{{ b }}</div>',
          props: ['b']
        }
      }
    }).$mount()
    expect(vm.$children.length).toBe(1)
    expect(vm.$el.innerHTML)
      .toBe('<span>hello</span><div>hello</div>')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>hello</span><div>hello</div>')
    }).then(done)
  })

  it('should rerender parent but not self', done => {
    const vm = new Vue({
      template: `<div>
                  <span>{{ a }}</span>
                  <item v-once :b="a"></item>
                </div>`,
      data: { a: 'hello' },
      components: {
        item: {
          template: '<div>{{ b }}</div>',
          props: ['b']
        }
      }
    }).$mount()
    expect(vm.$children.length).toBe(1)
    expect(vm.$el.innerHTML)
      .toBe('<span>hello</span><div>hello</div>')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>world</span><div>hello</div>')
    }).then(done)
  })

  it('should not rerender static sub nodes', done => {
    const vm = new Vue({
      template: `<div>
                  <span v-once>{{ a }}</span>
                  <item :b="a"></item>
                  <span>{{ suffix }}</span>
                </div>`,
      data: {
        a: 'hello',
        suffix: '?'
      },
      components: {
        item: {
          template: '<div>{{ b }}</div>',
          props: ['b']
        }
      }
    }).$mount()
    expect(vm.$el.innerHTML)
      .toBe('<span>hello</span><div>hello</div><span>?</span>')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>hello</span><div>world</div><span>?</span>')
      vm.suffix = '!'
    }).then(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>hello</span><div>world</div><span>!</span>')
    }).then(done)
  })
})
