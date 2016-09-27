import Vue from 'vue'

describe('Directive v-model file', () => {
  it('warn to use @change instead', () => {
    new Vue({
      data: {
        file: ''
      },
      template: '<input v-model="file" type="file">'
    }).$mount()
    expect('use @change instead').toHaveBeenWarned()
  })
})
