import Vue from 'vue'

describe('Directive v-pre', function () {
  it('should not compile inner content', function () {
    const vm = new Vue({
      template: `<div>
        <div v-pre>{{ a }}</div>
        <div>{{ a }}</div>
        <div v-pre>
          <component is="div"></component>
        </div>
      </div>`,
      data: {
        a: 123
      }
    })
    vm.$mount()
    expect(vm.$el.firstChild.textContent).toBe('{{ a }}')
    expect(vm.$el.children[1].textContent).toBe('123')
    expect(vm.$el.lastChild.innerHTML).toBe('<component is="div"></component>')
  })

  it('should not compile on root node', function () {
    const vm = new Vue({
      template: '<div v-pre>{{ a }}</div>',
      replace: true,
      data: {
        a: 123
      }
    })
    vm.$mount()
    expect(vm.$el.firstChild.textContent).toBe('{{ a }}')
  })

  // #8286
  it('should not compile custom component tags', function () {
    Vue.component('vtest', { template: ` <div>Hello World</div>` })
    const vm = new Vue({
      template: '<div v-pre><vtest></vtest></div>',
      replace: true
    })
    vm.$mount()
    expect(vm.$el.firstChild.tagName).toBe('VTEST')
  })

  // #10087
  it('should not compile attributes', function () {
    const vm = new Vue({
      template: '<div v-pre><p open="hello">A Test</p></div>'
    })
    vm.$mount()
    expect(vm.$el.firstChild.getAttribute('open')).toBe('hello')
  })
})
