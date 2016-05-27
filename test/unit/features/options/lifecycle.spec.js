import Vue from 'vue'

describe('Lifecycle API', () => {
  it('hooks', () => {
    const hooks = ['init', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed']

    const options = {
      data () {
        return {
          foo: 'bar'
        }
      }
    }

    hooks.map(hook => {
      options[hook] = jasmine.createSpy(hook)
    })

    const vm = new Vue(options)

    expect(options.init).toHaveBeenCalled()
    expect(options.created).toHaveBeenCalled()
    expect(options.beforeMount).not.toHaveBeenCalled()

    vm.$mount()
    expect(options.beforeMount).toHaveBeenCalled()
    expect(options.mounted).toHaveBeenCalled()

    vm._update(options)
    expect(options.beforeUpdate).toHaveBeenCalled()
    expect(options.updated).toHaveBeenCalled()

    vm.$destroy()
    expect(options.beforeDestroy).toHaveBeenCalled()
    expect(options.destroyed).toHaveBeenCalled()
  })
})
