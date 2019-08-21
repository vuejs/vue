import Vue from 'vue'

describe('Initialization', () => {
  it('with new', () => {
    expect(new Vue() instanceof Vue).toBe(true)
  })
})
