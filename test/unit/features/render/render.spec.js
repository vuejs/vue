import Vue from 'vue'

describe('Render', () => {
  let vm, el

  beforeEach(() => {
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  afterEach(() => {
    document.body.removeChild(vm.$el)
  })

  it('render with basic usage', () => {
    el.innerHTML = `<render :method="onRender" :args="'hello'"></render>`
    vm = new Vue({
      el,
      methods: {
        onRender (args) { return args }
      }
    }).$mount()
    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.innerHTML).toBe('hello')
  })

  it('should render with $createElement', () => {
    el.innerHTML = `<render :method="onRender" :args="message"></render>`
    vm = new Vue({
      el,
      data: { message: 'hello world' },
      methods: {
        onRender (args) {
          return this.$createElement('div', { class: 'message' }, [
            this.$createElement('p', {}, [args])
          ])
        }
      }
    }).$mount()
    expect(vm.$el.childNodes[0].tagName).toBe('DIV')
    expect(vm.$el.childNodes[0].classList.contains('message')).toBe(true)
    expect(vm.$el.childNodes[0].childNodes[0].tagName).toBe('P')
    expect(vm.$el.childNodes[0].childNodes[0].textContent).toBe('hello world')
  })

  it('should render with inline elements', () => {
    el.innerHTML = `
      <render :method="onRender" :args="message">
        <ul>
          <li v-for="n in 5"></li>
        </ul>
      </render>
    `
    vm = new Vue({
      el,
      data: { message: 'hello world' },
      methods: {
        onRender (args, vnode) {
          const ul = vnode[0]
          ul.children.forEach((li, i) => {
            li.data = { staticClass: `class${i}` }
          })
          return vnode
        }
      }
    }).$mount()
    const ul = vm.$el.children[0]
    expect(ul.tagName).toBe('UL')
    for (let i = 0; i < ul.children.length; i++) {
      const li = ul.children[i]
      expect(li.tagName).toBe('LI')
      expect(li.classList.contains(`class${i}`)).toBe(true)
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
    el.innerHTML = `<render :method="onRenderModal" :args="title"></render>`
    vm = new Vue({
      el,
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
})
