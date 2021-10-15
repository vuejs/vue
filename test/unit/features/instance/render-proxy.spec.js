import Vue from 'vue'

if (typeof Proxy !== 'undefined') {
  describe('render proxy', () => {
    it('should warn missing property in render fns with `with`', () => {
      new Vue({
        template: `<div>{{ a }}</div>`
      }).$mount()
      expect(`Property or method "a" is not defined`).toHaveBeenWarned()
    })

    it('should warn missing property in render fns without `with`', () => {
      const render = function (h) {
        return h('div', [this.a])
      }
      render._withStripped = true
      new Vue({
        render
      }).$mount()
      expect(`Property or method "a" is not defined`).toHaveBeenWarned()
    })

    it('should not warn for hand-written render functions', () => {
      new Vue({
        render (h) {
          return h('div', [this.a])
        }
      }).$mount()
      expect(`Property or method "a" is not defined`).not.toHaveBeenWarned()
    })

    it('support symbols using the `in` operator in hand-written render functions', () => {
      const sym = Symbol()

      const vm = new Vue({
        created () {
          this[sym] = 'foo'
        },
        render (h) {
          if (sym in this) {
            return h('div', [this[sym]])
          }
        }
      }).$mount()

      expect(vm.$el.textContent).toBe('foo')
    })

    it('should warn properties starting with $ when found', () => {
      new Vue({
        data: { $a: 'foo' },
        template: `<div>{{ $a }}</div>`
      }).$mount()
      expect(`Property "$a" must be accessed with "$data.$a"`).toHaveBeenWarned()
    })

    it('should warn properties starting with _ when found', () => {
      new Vue({
        data: { _foo: 'foo' },
        template: `<div>{{ _foo }}</div>`
      }).$mount()
      expect(`Property "_foo" must be accessed with "$data._foo"`).toHaveBeenWarned()
    })

    it('should warn properties starting with $ when not found', () => {
      new Vue({
        template: `<div>{{ $a }}</div>`
      }).$mount()
      expect(`Property or method "$a" is not defined`).toHaveBeenWarned()
      expect(`Property "$a" must be accessed with "$data.$a"`).not.toHaveBeenWarned()
    })

    it('should warn properties starting with $ when not found (with stripped)', () => {
      const render = function (h) {
        return h('p', this.$a)
      }
      render._withStripped = true
      new Vue({
        data: { $a: 'foo' },
        render
      }).$mount()
      expect(`Property "$a" must be accessed with "$data.$a"`).toHaveBeenWarned()
    })

    it('should not warn properties starting with $ when using $data to access', () => {
      new Vue({
        data: { $a: 'foo' },
        template: `<div>{{ $data.$a }}</div>`
      }).$mount()
      expect(`Property or method "$a" is not defined`).not.toHaveBeenWarned()
    })
  })
}
