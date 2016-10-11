import Vue from 'vue'
import { looseEqual } from 'shared/util'

/**
 * setting <select>'s value in IE9 doesn't work
 * we have to manually loop through the options
 */
function updateSelect (el, value) {
  var options = el.options
  var i = options.length
  while (i--) {
    if (looseEqual(getValue(options[i]), value)) {
      options[i].selected = true
      break
    }
  }
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value || option.text
}

describe('Directive v-model select', () => {
  it('should work', done => {
    const vm = new Vue({
      data: {
        test: 'b'
      },
      template:
        '<select v-model="test">' +
          '<option>a</option>' +
          '<option>b</option>' +
          '<option>c</option>' +
        '</select>'
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.test).toBe('b')
    expect(vm.$el.value).toBe('b')
    expect(vm.$el.childNodes[1].selected).toBe(true)
    vm.test = 'c'
    waitForUpdate(function () {
      expect(vm.$el.value).toBe('c')
      expect(vm.$el.childNodes[2].selected).toBe(true)
      updateSelect(vm.$el, 'a')
      triggerEvent(vm.$el, 'change')
      expect(vm.test).toBe('a')
    }).then(done)
  })

  it('should work with value bindings', done => {
    const vm = new Vue({
      data: {
        test: 2
      },
      template:
        '<select v-model="test">' +
          '<option value="1">a</option>' +
          '<option :value="2">b</option>' +
          '<option :value="3">c</option>' +
        '</select>'
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.$el.value).toBe('2')
    expect(vm.$el.childNodes[1].selected).toBe(true)
    vm.test = 3
    waitForUpdate(function () {
      expect(vm.$el.value).toBe('3')
      expect(vm.$el.childNodes[2].selected).toBe(true)
      updateSelect(vm.$el, '1')
      triggerEvent(vm.$el, 'change')
      expect(vm.test).toBe('1')
    }).then(done)
  })

  it('should work with value bindings (object loose equal)', done => {
    const vm = new Vue({
      data: {
        test: { a: 2 }
      },
      template:
        '<select v-model="test">' +
          '<option value="1">a</option>' +
          '<option :value="{ a: 2 }">b</option>' +
          '<option :value="{ a: 3 }">c</option>' +
        '</select>'
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.$el.childNodes[1].selected).toBe(true)
    vm.test = { a: 3 }
    waitForUpdate(function () {
      expect(vm.$el.childNodes[2].selected).toBe(true)

      updateSelect(vm.$el, '1')
      triggerEvent(vm.$el, 'change')
      expect(vm.test).toBe('1')

      updateSelect(vm.$el, { a: 2 })
      triggerEvent(vm.$el, 'change')
      expect(vm.test).toEqual({ a: 2 })
    }).then(done)
  })

  it('should work with v-for', done => {
    const vm = new Vue({
      data: {
        test: 'b',
        opts: ['a', 'b', 'c']
      },
      template:
        '<select v-model="test">' +
          '<option v-for="o in opts">{{ o }}</option>' +
        '</select>'
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.test).toBe('b')
    expect(vm.$el.value).toBe('b')
    expect(vm.$el.childNodes[1].selected).toBe(true)
    vm.test = 'c'
    waitForUpdate(function () {
      expect(vm.$el.value).toBe('c')
      expect(vm.$el.childNodes[2].selected).toBe(true)
      updateSelect(vm.$el, 'a')
      triggerEvent(vm.$el, 'change')
      expect(vm.test).toBe('a')
      // update v-for opts
      vm.opts = ['d', 'a']
    }).then(() => {
      expect(vm.$el.childNodes[0].selected).toBe(false)
      expect(vm.$el.childNodes[1].selected).toBe(true)
    }).then(done)
  })

  it('should work with v-for & value bindings', done => {
    const vm = new Vue({
      data: {
        test: 2,
        opts: [1, 2, 3]
      },
      template:
        '<select v-model="test">' +
          '<option v-for="o in opts" :value="o">optio {{ o }}</option>' +
        '</select>'
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.$el.value).toBe('2')
    expect(vm.$el.childNodes[1].selected).toBe(true)
    vm.test = 3
    waitForUpdate(function () {
      expect(vm.$el.value).toBe('3')
      expect(vm.$el.childNodes[2].selected).toBe(true)
      updateSelect(vm.$el, 1)
      triggerEvent(vm.$el, 'change')
      expect(vm.test).toBe(1)
      // update v-for opts
      vm.opts = [0, 1]
    }).then(() => {
      expect(vm.$el.childNodes[0].selected).toBe(false)
      expect(vm.$el.childNodes[1].selected).toBe(true)
    }).then(done)
  })

  it('multiple', done => {
    const vm = new Vue({
      data: {
        test: ['b']
      },
      template:
        '<select v-model="test" multiple>' +
          '<option>a</option>' +
          '<option>b</option>' +
          '<option>c</option>' +
        '</select>'
    }).$mount()
    var opts = vm.$el.options
    expect(opts[0].selected).toBe(false)
    expect(opts[1].selected).toBe(true)
    expect(opts[2].selected).toBe(false)
    vm.test = ['a', 'c']
    waitForUpdate(() => {
      expect(opts[0].selected).toBe(true)
      expect(opts[1].selected).toBe(false)
      expect(opts[2].selected).toBe(true)
      opts[0].selected = false
      opts[1].selected = true
      triggerEvent(vm.$el, 'change')
      expect(vm.test).toEqual(['b', 'c'])
    }).then(done)
  })

  it('multiple with static template', () => {
    const vm = new Vue({
      template:
      '<select multiple>' +
        '<option selected>a</option>' +
        '<option selected>b</option>' +
        '<option selected>c</option>' +
      '</select>'
    }).$mount()
    var opts = vm.$el.options
    expect(opts[0].selected).toBe(true)
    expect(opts[1].selected).toBe(true)
    expect(opts[2].selected).toBe(true)
  })

  it('multiple + v-for', done => {
    const vm = new Vue({
      data: {
        test: ['b'],
        opts: ['a', 'b', 'c']
      },
      template:
        '<select v-model="test" multiple>' +
          '<option v-for="o in opts">{{ o }}</option>' +
        '</select>'
    }).$mount()
    var opts = vm.$el.options
    expect(opts[0].selected).toBe(false)
    expect(opts[1].selected).toBe(true)
    expect(opts[2].selected).toBe(false)
    vm.test = ['a', 'c']
    waitForUpdate(() => {
      expect(opts[0].selected).toBe(true)
      expect(opts[1].selected).toBe(false)
      expect(opts[2].selected).toBe(true)
      opts[0].selected = false
      opts[1].selected = true
      triggerEvent(vm.$el, 'change')
      expect(vm.test).toEqual(['b', 'c'])
      // update v-for opts
      vm.opts = ['c', 'd']
    }).then(() => {
      expect(opts[0].selected).toBe(true)
      expect(opts[1].selected).toBe(false)
      expect(vm.test).toEqual(['c']) // should remove 'd' which no longer has a matching option
    }).then(done)
  })

  it('should warn inline selected', () => {
    const vm = new Vue({
      data: {
        test: null
      },
      template:
        '<select v-model="test">' +
          '<option selected>a</option>' +
        '</select>'
    }).$mount()
    expect(vm.$el.selectedIndex).toBe(-1)
    expect('inline selected attributes on <option> will be ignored when using v-model')
      .toHaveBeenWarned()
  })

  it('should warn multiple with non-Array value', () => {
    new Vue({
      data: {
        test: 'meh'
      },
      template:
        '<select v-model="test" multiple></select>'
    }).$mount()
    expect('<select multiple v-model="test"> expects an Array value for its binding, but got String')
      .toHaveBeenWarned()
  })
})
