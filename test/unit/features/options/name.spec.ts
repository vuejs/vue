import Vue from 'vue'

describe('Options name', () => {
  it('should contain itself in self components', () => {
    const vm = Vue.extend({
      name: 'SuperVue'
    })

    expect(vm.options.components['SuperVue']).toEqual(vm)
  })

  it('should warn when incorrect name given', () => {
    Vue.extend({
      name: 'Hyper*Vue'
    })

    expect(`Invalid component name: "Hyper*Vue".`).toHaveBeenWarned()

    Vue.extend({
      name: '2Cool2BValid'
    })

    expect(`Invalid component name: "2Cool2BValid".`).toHaveBeenWarned()
  })

  it('id should not override given name when using Vue.component', () => {
    const SuperComponent = Vue.component('super-component', {
      name: 'SuperVue'
    })!

    expect(SuperComponent.options.components['SuperVue']).toEqual(
      SuperComponent
    )
    expect(SuperComponent.options.components['super-component']).toEqual(
      SuperComponent
    )
  })

  it('should allow all potential custom element name for component name including non-alphanumeric characters', () => {
    Vue.extend({
      name: 'my-컴포넌트'
    })

    expect(`Invalid component name`).not.toHaveBeenWarned()
  })
})
