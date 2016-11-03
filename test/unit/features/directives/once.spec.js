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
      .toBe('<span>hello</span> <div>hello</div>')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>hello</span> <div>hello</div>')
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
      .toBe('<span>hello</span> <div>hello</div>')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>world</span> <div>hello</div>')
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
      .toBe('<span>hello</span> <div>hello</div> <span>?</span>')
    vm.a = 'world'
    waitForUpdate(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>hello</span> <div>world</div> <span>?</span>')
      vm.suffix = '!'
    }).then(() => {
      expect(vm.$el.innerHTML)
        .toBe('<span>hello</span> <div>world</div> <span>!</span>')
    }).then(done)
  })

  it('should work with v-for', done => {
    const vm = new Vue({
      data: {
        list: [1, 2, 3]
      },
      template: `<div><div v-for="i in list" v-once>{{i}}</div></div>`
    }).$mount()
    expect(vm.$el.textContent).toBe('123')
    vm.list.reverse()
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('123')
    }).then(done)
  })

  it('should work inside v-for', done => {
    const vm = new Vue({
      data: {
        list: [
          { id: 0, text: 'a' },
          { id: 1, text: 'b' },
          { id: 2, text: 'c' }
        ]
      },
      template: `
        <div>
          <div v-for="i in list" :key="i.id">
            <div>
              <span v-once>{{ i.text }}</span><span>{{ i.text }}</span>
            </div>
          </div>
        </div>
      `
    }).$mount()

    expect(vm.$el.textContent).toBe('aabbcc')

    vm.list[0].text = 'd'
    waitForUpdate(() => {
      expect(vm.$el.textContent).toBe('adbbcc')
      vm.list[1].text = 'e'
    }).then(() => {
      expect(vm.$el.textContent).toBe('adbecc')
      vm.list.reverse()
    }).then(() => {
      expect(vm.$el.textContent).toBe('ccbead')
    }).then(done)
  })

  it('should warn inside non-keyed v-for', () => {
    const vm = new Vue({
      data: {
        list: [
          { id: 0, text: 'a' },
          { id: 1, text: 'b' },
          { id: 2, text: 'c' }
        ]
      },
      template: `
        <div>
          <div v-for="i in list">
            <span v-once>{{ i.text }}</span><span>{{ i.text }}</span>
          </div>
        </div>
      `
    }).$mount()

    expect(vm.$el.textContent).toBe('aabbcc')
    expect(`v-once can only be used inside v-for that is keyed.`).toHaveBeenWarned()
  })
})
