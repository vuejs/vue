import Vue from 'vue'

describe('Initialization', () => {
  it('without new', () => {
    try { Vue('div') } catch (e) {}
    expect('Vue is a constructor and should be called with the `new` keyword').toHaveBeenWarned()
  })

  it('with new', () => {
    expect(new Vue('div') instanceof Vue).toBe(true)
  })
})
