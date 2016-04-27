import Vue from 'vue'

describe('Directive v-once', () => {
  it('should not rerender component', done => {
    const vm = new Vue({
      el: '#app',
      template: '<div v-once>{{ a }}</div>',
      data: { a: 'hello' }
    })

    expect(vm.$el.innerHTML).toBe('hello')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('hello')
      done()
    }).catch(done)
  })

  it('should not rerender self and child component', done => {
    const vm = new Vue({
      el: '#app',
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
    })

    expect(vm.$children.length).toBe(0)
    expect(vm.$el.innerHTML)
      .toBe('<span>hello</span><div>hello</div>')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>hello</span><div>hello</div>')
      done()
    }).catch(done)
  })

  it('should rerender parent but not self', done => {
    const vm = new Vue({
      el: '#app',
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
    })

    expect(vm.$children.length).toBe(0)
    expect(vm.$el.innerHTML)
      .toBe('<span>hello</span><div>hello</div>')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>world</span><div>hello</div>')
      done()
    }).catch(done)
  })

  it('should not rerender static sub nodes', done => {
    const vm = new Vue({
      el: '#app',
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
    })

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
      done()
    }).catch(done)
  })
})
