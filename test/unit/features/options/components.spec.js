import Vue from 'vue'

describe('Options components', () => {
  it('should accept plain object', () => {
    const vm = new Vue({
      template: '<test></test>',
      components: {
        test: {
          template: '<div>hi</div>'
        }
      }
    }).$mount()
    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.textContent).toBe('hi')
  })

  it('should accept extended constructor', () => {
    const Test = Vue.extend({
      template: '<div>hi</div>'
    })
    const vm = new Vue({
      template: '<test></test>',
      components: {
        test: Test
      }
    }).$mount()
    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.textContent).toBe('hi')
  })

  it('should accept camelCase', () => {
    const myComp = {
      template: '<div>hi</div>'
    }
    const vm = new Vue({
      template: '<my-comp></my-comp>',
      components: {
        myComp
      }
    }).$mount()
    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.textContent).toBe('hi')
  })

  it('should accept PascalCase', () => {
    const MyComp = {
      template: '<div>hi</div>'
    }
    const vm = new Vue({
      template: '<my-comp></my-comp>',
      components: {
        MyComp
      }
    }).$mount()
    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.textContent).toBe('hi')
  })

  it('should warn native HTML elements', () => {
    new Vue({
      components: {
        div: { template: '<div></div>' }
      }
    })
    expect('Do not use built-in or reserved HTML elements as component').toHaveBeenWarned()
  })

  it('should warn built-in elements', () => {
    new Vue({
      components: {
        component: { template: '<div></div>' }
      }
    })
    expect('Do not use built-in or reserved HTML elements as component').toHaveBeenWarned()
  })

  it('warn non-existent', () => {
    new Vue({
      template: '<test></test>'
    }).$mount()
    expect('Unknown custom element: <test>').toHaveBeenWarned()
  })
})
