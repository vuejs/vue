import Vue from 'vue'

describe('Options model', () => {
  it('key should fallback to attrs if prop is not defined in component', () => {
    const ChildComp = {
      model: {
        prop: 'value',
        event: 'update:value'
      },
      render: () => {}
    }

    const vm = new Vue({
      components: {
        ChildComp
      },
      data () {
        return {
          value: 'value'
        }
      },
      template: '<child-comp v-model="value" ref="child-comp" />'
    }).$mount()

    expect(vm.$refs['child-comp'].$attrs.value).toEqual(vm.value)
  })
})
