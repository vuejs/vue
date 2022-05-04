import Vue from 'vue'

describe('Initialization', () => {
  it('without new', () => {
    // @ts-expect-error
    try { Vue() } catch (e) {}
    expect('Vue is a constructor and should be called with the `new` keyword').toHaveBeenWarned()
  })

  it('with new', () => {
    // @ts-expect-error
    expect(new Vue() instanceof Vue).toBe(true)
  })
})
