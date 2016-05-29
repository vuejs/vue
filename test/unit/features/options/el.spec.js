import Vue from 'vue'

describe('Options el', () => {
  it('basic usage', () => {
    const el = document.createElement('div')
    el.innerHTML = '<span>{{message}}</span>'
    const vm = new Vue({
      el,
      data: { message: 'hello world' }
    })
    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.textContent).toBe(vm.message)
  })

  it('should be replaced when use togther with `template` option', () => {
    const el = document.createElement('div')
    el.innerHTML = '<span>{{message}}</span>'
    const vm = new Vue({
      el,
      template: '<p id="app"><span>{{message}}</span></p>',
      data: { message: 'hello world' }
    })
    expect(vm.$el.tagName).toBe('P')
    expect(vm.$el.textContent).toBe(vm.message)
  })

  it('should be replaced when use togther with `render` option', () => {
    const el = document.createElement('div')
    el.innerHTML = '<span>{{message}}</span>'
    const vm = new Vue({
      el,
      render () {
        const h = this.$createElement
        return h('p', { staticAttrs: { id: 'app' }}, [
          h('span', {}, [this.message])
        ])
      },
      data: { message: 'hello world' }
    })
    expect(vm.$el.tagName).toBe('P')
    expect(vm.$el.textContent).toBe(vm.message)
  })

  it('svg element', () => {
    const ns = 'http://www.w3.org/2000/svg'
    const el = document.createElementNS(ns, 'svg')
    const text = document.createElementNS(ns, 'text')
    text.setAttribute(':x', 'x')
    text.setAttribute(':y', 'y')
    text.setAttribute(':fill', 'color')
    text.textContent = '{{text}}'
    el.appendChild(text)
    const vm = new Vue({
      el,
      data: {
        x: 64, y: 128, color: 'red', text: 'svg text'
      }
    })
    expect(vm.$el.tagName).toBe('svg')
    expect(vm.$el.childNodes[0].getAttribute('x')).toBe(vm.x.toString())
    expect(vm.$el.childNodes[0].getAttribute('y')).toBe(vm.y.toString())
    expect(vm.$el.childNodes[0].getAttribute('fill')).toBe(vm.color)
    expect(vm.$el.childNodes[0].textContent).toBe(vm.text)
  })

  it('warn cannot find element', () => {
    new Vue({ el: '#non-existent' })
    expect('Cannot find element: #non-existent').toHaveBeenWarned()
  })
})
