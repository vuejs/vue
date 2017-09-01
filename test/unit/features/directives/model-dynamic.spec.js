import Vue from 'vue'

describe('Directive v-model dynamic input type', () => {
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
