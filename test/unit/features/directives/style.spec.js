import Vue from 'vue'
import { extend } from 'shared/util'

function checkPrefixedProp (prop) {
  var el = document.createElement('div')
  var upper = prop.charAt(0).toUpperCase() + prop.slice(1)
  if (!(prop in el.style)) {
    var prefixes = ['Webkit', 'Moz', 'ms']
    var i = prefixes.length
    while (i--) {
      if ((prefixes[i] + upper) in el.style) {
        prop = prefixes[i] + upper
      }
    }
  }
  return prop
}

describe('Directive v-bind:style', () => {
  let vm

  beforeEach(() => {
    vm = new Vue({
      template: '<div :style="styles"></div>',
      data () {
        return {
          styles: {},
          fontSize: 16
        }
      }
    }).$mount()
  })

  it('plain object', done => {
    vm.styles = { color: 'red' }
    waitForUpdate(() => {
      expect(vm.$el.style.cssText.replace(/\s/g, '')).toBe('color:red;')
    }).then(done)
  })

  it('camelCase', done => {
    vm.styles = { marginRight: '10px' }
    waitForUpdate(() => {
      expect(vm.$el.style.marginRight).toBe('10px')
    }).then(done)
  })

  it('remove if falsy value', done => {
    vm.$el.style.color = 'red'
    waitForUpdate(() => {
      vm.styles = { color: null }
    }).then(() => {
      expect(vm.$el.style.color).toBe('')
    }).then(done)
  })

  it('ignore unsupported property', done => {
    vm.styles = { foo: 'bar' }
    waitForUpdate(() => {
      expect(vm.$el.style.foo).not.toBe('bar')
    }).then(done)
  })

  it('auto prefix', done => {
    const prop = checkPrefixedProp('transform')
    const val = 'scale(0.5)'
    vm.styles = { transform: val }
    waitForUpdate(() => {
      expect(vm.$el.style[prop]).toBe(val)
    }).then(done)
  })

  it('object with multiple entries', done => {
    vm.$el.style.color = 'red'
    vm.styles = {
      marginLeft: '10px',
      marginRight: '15px'
    }
    waitForUpdate(() => {
      expect(vm.$el.style.getPropertyValue('color')).toBe('red')
      expect(vm.$el.style.getPropertyValue('margin-left')).toBe('10px')
      expect(vm.$el.style.getPropertyValue('margin-right')).toBe('15px')
      vm.styles = {
        color: 'blue',
        padding: null
      }
    }).then(() => {
      expect(vm.$el.style.getPropertyValue('color')).toBe('blue')
      expect(vm.$el.style.getPropertyValue('padding')).toBeFalsy()
      expect(vm.$el.style.getPropertyValue('margin-left')).toBeFalsy()
      expect(vm.$el.style.getPropertyValue('margin-right')).toBeFalsy()
      // handle falsy value
      vm.styles = null
    }).then(() => {
      expect(vm.$el.style.getPropertyValue('color')).toBeFalsy()
      expect(vm.$el.style.getPropertyValue('padding')).toBeFalsy()
      expect(vm.$el.style.getPropertyValue('margin-left')).toBeFalsy()
      expect(vm.$el.style.getPropertyValue('margin-right')).toBeFalsy()
    }).then(done)
  })

  it('array of objects', done => {
    vm.$el.style.padding = '10px'
    vm.styles = [{ color: 'red' }, { marginRight: '20px' }]

    waitForUpdate(() => {
      expect(vm.$el.style.getPropertyValue('color')).toBe('red')
      expect(vm.$el.style.getPropertyValue('margin-right')).toBe('20px')
      expect(vm.$el.style.getPropertyValue('padding')).toBe('10px')
      vm.styles = [{ color: 'blue' }, { padding: null }]
    }).then(() => {
      expect(vm.$el.style.getPropertyValue('color')).toBe('blue')
      expect(vm.$el.style.getPropertyValue('margin-right')).toBeFalsy()
      expect(vm.$el.style.getPropertyValue('padding')).toBeFalsy()
    }).then(done)
  })

  it('updates objects deeply', done => {
    const el = document.createElement('div')
    el.setAttribute(':style', 'divStyling')
    vm = new Vue({
      el,
      data () {
        return {
          divStyling: { display: 'none' }
        }
      }
    })
    waitForUpdate(() => {
      expect(vm.$el.style.display).toBe('none')
      vm.divStyling = extend({}, { display: 'block' })
    }).then(() => {
      expect(vm.$el.style.display).toBe('block')
    }).then(done)
  })

  it('background size with only one value', done => {
    vm.styles = { backgroundSize: '100%' }
    waitForUpdate(() => {
      expect(vm.$el.style.cssText.replace(/\s/g, '')).toMatch(/background-size:100%(auto)?;/)
    }).then(done)
  })

  it('should work with interpolation', done => {
    vm.styles = { fontSize: `${vm.fontSize}px` }
    waitForUpdate(() => {
      expect(vm.$el.style.fontSize).toBe('16px')
    }).then(done)
  })
})
