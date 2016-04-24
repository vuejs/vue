import Vue from 'vue'

describe('Global config', () => {
  describe('preserveWhitespace', () => {
    it('should be true by default', () => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div><span>hi</span> <span>ha</span></div>'
      })
      expect(vm.$el.innerHTML).toBe('<span>hi</span> <span>ha</span>')
    })

    it('should remove whitespaces when set to false', () => {
      Vue.config.preserveWhitespace = false
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div><span>hi</span> <span>ha</span></div>'
      })
      expect(vm.$el.innerHTML).toBe('<span>hi</span><span>ha</span>')
      Vue.config.preserveWhitespace = true
    })
  })

  describe('silent', () => {
    it('should be false by default', () => {
      Vue.util.warn('foo')
      expect('foo').toHaveBeenWarned()
    })

    it('should work when set to true', () => {
      Vue.config.silent = true
      Vue.util.warn('foo')
      expect('foo').not.toHaveBeenWarned()
      Vue.config.silent = false
    })
  })
})
