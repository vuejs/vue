import Vue from 'vue'

describe('Options name', () => {
  it('should warn when giving instance a name', () => {
    new Vue({
      name: 'SuperVue'
    }).$mount()

    /* eslint-disable */
    expect(`options "name" can only be used as a component definition option, not during instance creation.`)
      .toHaveBeenWarned()
    /* eslint-enable */
  })

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

    /* eslint-disable */
    expect(`Invalid component name: "Hyper*Vue". Component names can only contain alphanumeric characaters and the hyphen.`)
      .toHaveBeenWarned()
    /* eslint-enable */
  })

  it('when incorrect name given it should not contain itself in self components', () => {
    const vm = Vue.extend({
      name: 'Hyper*Vue'
    })

    expect(vm.options.components['Hyper*Vue']).toBeUndefined()
  })

  it('id should override given name when using Vue.component', () => {
    const SuperComponent = Vue.component('super-component', {
      name: 'SuperVue'
    })

    expect(SuperComponent.options.components['SuperVue']).toBeUndefined()
    expect(SuperComponent.options.components['super-component']).toBeDefined()
    expect(SuperComponent.options.components['super-component']).toEqual(SuperComponent)
  })
})
