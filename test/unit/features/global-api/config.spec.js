import Vue from 'vue'
import { warn } from 'core/util/debug'

describe('Global config', () => {
  it('should warn replacing config object', () => {
    const originalConfig = Vue.config
    Vue.config = {}
    expect(Vue.config).toBe(originalConfig)
    expect('Do not replace the Vue.config object').toHaveBeenWarned()
  })

  describe('silent', () => {
    it('should be false by default', () => {
      warn('foo')
      expect('foo').toHaveBeenWarned()
    })

    it('should work when set to true', () => {
      Vue.config.silent = true
      warn('foo')
      expect('foo').not.toHaveBeenWarned()
      Vue.config.silent = false
    })
  })

  describe('optionMergeStrategies', () => {
    it('should allow defining custom option merging strategies', () => {
      const spy = jasmine.createSpy('option merging')
      Vue.config.optionMergeStrategies.__test__ = (parent, child, vm) => {
        spy(parent, child, vm)
        return child + 1
      }
      const Test = Vue.extend({
        __test__: 1
      })
      expect(spy.calls.count()).toBe(1)
      expect(spy).toHaveBeenCalledWith(undefined, 1, undefined)
      expect(Test.options.__test__).toBe(2)
      const test = new Test({
        __test__: 2
      })
      expect(spy.calls.count()).toBe(2)
      expect(spy).toHaveBeenCalledWith(2, 2, test)
      expect(test.$options.__test__).toBe(3)
    })
  })

  describe('ignoredElements', () => {
    it('should work', () => {
      Vue.config.ignoredElements = ['foo', /^ion-/]
      new Vue({
        template: `<div><foo/><ion-foo/><ion-bar/></div>`
      }).$mount()
      expect('Unknown custom element').not.toHaveBeenWarned()
      Vue.config.ignoredElements = []
    })
  })

  describe('async', () => {
    it('does not update synchronously when true', () => {
      const spy = jasmine.createSpy()
      const vm = new Vue({
        template: `<div :class="value"></div>`,
        updated: spy,
        data: { value: true }
      }).$mount()
      vm.value = false
      expect(spy).not.toHaveBeenCalled()
    })

    it('updates synchronously when false', () => {
      const spy = jasmine.createSpy()
      Vue.config.async = false
      const vm = new Vue({
        template: `<div :class="value"></div>`,
        updated: spy,
        data: { value: true }
      }).$mount()
      vm.value = false
      expect(spy).toHaveBeenCalled()
      Vue.config.async = true
    })

    it('runs watchers in correct order when false', () => {
      Vue.config.async = false
      const vm = new Vue({
        template: `
          <div id="app">
            {{ computed }}
          </div>`,
        props: ['prop'],
        propsData: {
          'prop': []
        },
        data: () => ({
          data: ''
        }),
        computed: {
          computed () {
            return this.prop.join(',')
          }
        },
        watch: {
          prop: 'execute'
        },
        methods: {
          execute () {
            this.data = this.computed
          }
        }
      }).$mount()
      expect(vm.computed).toBe('')
      expect(vm.data).toBe('')

      vm.prop = [1, 2, 3]
      expect(vm.computed).toBe('1,2,3')
      expect(vm.data).toBe('1,2,3')

      vm.prop.push(4, 5)
      expect(vm.computed).toBe('1,2,3,4,5')
      expect(vm.data).toBe('1,2,3,4,5')
      Vue.config.async = true
    })
  })
})
