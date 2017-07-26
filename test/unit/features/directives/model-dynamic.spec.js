import Vue from 'vue'

describe('Directive v-model dynamic input type', () => {
  it('should not warn if supported ternary', function () {
    new Vue({
      data: {
        type: 'text',
        text: 'hi'
      },
      template: `<input :type="type ? 'text' : 'password'" v-model="text">`
    }).$mount()
    expect(`v-model does not support dynamic input types`).not.toHaveBeenWarned()
  })
  it('should warn', function () {
    new Vue({
      data: {
        type: 'text',
        text: 'hi'
      },
      template: `<input :type="type" v-model="text">`
    }).$mount()
    expect(`v-model does not support dynamic input types`).toHaveBeenWarned()
  })
})
