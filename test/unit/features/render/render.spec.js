import Vue from 'vue'

describe('Render', () => {
  it('render with basic usage', () => {
    const vm = new Vue({
      template: `<div><render :method="onRender" :args="'hello'"></render></div>`,
      methods: {
        onRender (args) { return args }
      }
    }).$mount()
    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.innerHTML).toBe('hello')
  })

  it('should render with $createElement', () => {
    const vm = new Vue({
      template: `<div><render :method="onRender" :args="message"></render></div>`,
      data: { message: 'hello world' },
      methods: {
        onRender (args) {
          const h = this.$createElement
          return h('div', { class: 'message' }, [
            h('p', {}, [args])
          ])
        }
      }
    }).$mount()
    expect(vm.$el.childNodes[0].tagName).toBe('DIV')
    expect(vm.$el.childNodes[0]).toHaveClass('message')
    expect(vm.$el.childNodes[0].childNodes[0].tagName).toBe('P')
    expect(vm.$el.childNodes[0].childNodes[0].textContent).toBe('hello world')
  })

  it('should render with inline elements', () => {
    const vm = new Vue({
      template: `
        <render :method="onRender" :args="message">
          <ul>
            <li v-for="n in 5"></li>
          </ul>
        </render>
      `,
      data: { message: 'hello world' },
      methods: {
        onRender (args, children) {
          const ul = children[0]
          ul.children.forEach((li, i) => {
            li.data = { staticClass: `class${i}` }
          })
          return ul
        }
      }
    }).$mount()
    const ul = vm.$el
    expect(ul.tagName).toBe('UL')
    for (let i = 0; i < ul.children.length; i++) {
      const li = ul.children[i]
      expect(li.tagName).toBe('LI')
      expect(li).toHaveClass(`class${i}`)
    }
  })

  it('should render component', done => {
    const modal = {
      template: `
        <div class="modal-container">
          <div class="modal-header">
            <h1 class="modal-title">{{title}}</h1>
          </div>
          <div class="modal-body">
            <slot name="body">default body</slot>
          </div>
          <div class="modal-footer">
            <button class="modal-action-close" @click="$emit('close')">close</div>
          </div>
        </div>
      `,
      props: {
        title: {
          type: String, default: 'title1'
        }
      }
    }
    const vm = new Vue({
      template: `<div><render :method="onRenderModal" :args="title"></render></div>`,
      data: {
        shown: true,
        title: 'hello modal'
      },
      components: { modal },
      methods: {
        onRenderModal (title) {
          return this.$createElement('modal', {
            props: { title: title },
            on: { close: this.onCloseModal },
            directives: [{ name: 'show', value: this.shown }]
          })
        },
        onCloseModal () { this.shown = false }
      }
    }).$mount()
    expect(vm.$el.querySelector('.modal-title').textContent).toBe(vm.title)
    vm.$el.querySelector('.modal-action-close').click()
    waitForUpdate(() => {
      expect(vm.shown).toBe(false)
    }).then(() => {
      expect(vm.$el.querySelector('.modal-container').style.display).toBe('none')
    }).then(done)
  })

  it('should warn no method', () => {
    new Vue({
      template: '<render></render>'
    }).$mount()
    expect('method attribute is required on <render>').toHaveBeenWarned()
  })

  it('should warn method/arg usage without v-bind', () => {
    new Vue({
      template: '<render method="a"></render>'
    }).$mount()
    expect('<render> method should use a dynamic binding').toHaveBeenWarned()
  })

  it('should warn non dynamic args', () => {
    new Vue({
      template: '<render :method="a" args="b"></render>',
      methods: {
        a: () => {}
      }
    }).$mount()
    expect('<render> args should use a dynamic binding').toHaveBeenWarned()
  })
})
