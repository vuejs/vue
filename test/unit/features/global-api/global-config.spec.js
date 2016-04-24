import Vue from 'vue'

describe('Global config', function () {
  describe('preserveWhitespace', function () {
    it('should be true by default', function () {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div><span>hi</span> <span>ha</span></div>'
      })
      expect(vm.$el.innerHTML).toBe('<span>hi</span> <span>ha</span>')
    })

    it('should remove whitespaces when set to false', function () {
      Vue.config.preserveWhitespace = false
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div><span>hi</span> <span>ha</span></div>'
      })
      expect(vm.$el.innerHTML).toBe('<span>hi</span><span>ha</span>')
      Vue.config.preserveWhitespace = true
    })
  })

  describe('silent', function () {
    it('should be false by default', function () {
      Vue.util.warn('foo')
      expect('foo').toHaveBeenWarned()
    })

    it('should work when set to true', function () {
      Vue.config.silent = true
      Vue.util.warn('foo')
      expect('foo').not.toHaveBeenWarned()
      Vue.config.silent = false
    })
  })
})
