import Vue from 'vue'

describe('Directive v-model checkbox', () => {
  it('should work', done => {
    const vm = new Vue({
      data: {
        test: true
      },
      template: '<input type="checkbox" v-model="test">'
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.$el.checked).toBe(true)
    vm.test = false
    waitForUpdate(function () {
      expect(vm.$el.checked).toBe(false)
      expect(vm.test).toBe(false)
      vm.$el.click()
      expect(vm.$el.checked).toBe(true)
      expect(vm.test).toBe(true)
    }).then(() => {
      document.body.removeChild(vm.$el)
    }).then(done)
  })

  it('should respect value bindings', done => {
    const vm = new Vue({
      data: {
        test: 1,
        a: 1,
        b: 2
      },
      template: '<input type="checkbox" v-model="test" :true-value="a" :false-value="b">'
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.$el.checked).toBe(true)
    vm.$el.click()
    expect(vm.$el.checked).toBe(false)
    expect(vm.test).toBe(2)
    vm.$el.click()
    expect(vm.$el.checked).toBe(true)
    expect(vm.test).toBe(1)
    vm.test = 2
    waitForUpdate(() => {
      expect(vm.$el.checked).toBe(false)
      vm.test = 1
    }).then(() => {
      expect(vm.$el.checked).toBe(true)
      document.body.removeChild(vm.$el)
    }).then(done)
  })

  it('bind to Array value', done => {
    const vm = new Vue({
      data: {
        test: ['1']
      },
      template: `
        <div>
          <input type="checkbox" v-model="test" value="1">
          <input type="checkbox" v-model="test" value="2">
        </div>
      `
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.$el.children[0].checked).toBe(true)
    expect(vm.$el.children[1].checked).toBe(false)
    vm.$el.children[0].click()
    expect(vm.test.length).toBe(0)
    vm.$el.children[1].click()
    expect(vm.test).toEqual(['2'])
    vm.$el.children[0].click()
    expect(vm.test).toEqual(['2', '1'])
    vm.test = ['1']
    waitForUpdate(() => {
      expect(vm.$el.children[0].checked).toBe(true)
      expect(vm.$el.children[1].checked).toBe(false)
    }).then(done)
  })

  it('bind to Array value with value bindings', done => {
    const vm = new Vue({
      data: {
        test: [1]
      },
      template: `
        <div>
          <input type="checkbox" v-model="test" :value="1">
          <input type="checkbox" v-model="test" :value="2">
        </div>
      `
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.$el.children[0].checked).toBe(true)
    expect(vm.$el.children[1].checked).toBe(false)
    vm.$el.children[0].click()
    expect(vm.test.length).toBe(0)
    vm.$el.children[1].click()
    expect(vm.test).toEqual([2])
    vm.$el.children[0].click()
    expect(vm.test).toEqual([2, 1])
    vm.test = [1]
    waitForUpdate(() => {
      expect(vm.$el.children[0].checked).toBe(true)
      expect(vm.$el.children[1].checked).toBe(false)
    }).then(done)
  })

  it('bind to Array value with value bindings (object loose equal)', done => {
    const vm = new Vue({
      data: {
        test: [{ a: 1 }]
      },
      template: `
        <div>
          <input type="checkbox" v-model="test" :value="{ a: 1 }">
          <input type="checkbox" v-model="test" :value="{ a: 2 }">
        </div>
      `
    }).$mount()
    document.body.appendChild(vm.$el)
    expect(vm.$el.children[0].checked).toBe(true)
    expect(vm.$el.children[1].checked).toBe(false)
    vm.$el.children[0].click()
    expect(vm.test.length).toBe(0)
    vm.$el.children[1].click()
    expect(vm.test).toEqual([{ a: 2 }])
    vm.$el.children[0].click()
    expect(vm.test).toEqual([{ a: 2 }, { a: 1 }])
    vm.test = [{ a: 1 }]
    waitForUpdate(() => {
      expect(vm.$el.children[0].checked).toBe(true)
      expect(vm.$el.children[1].checked).toBe(false)
    }).then(done)
  })

  it('.number modifier', () => {
    const vm = new Vue({
      data: {
        test: [],
        check: true
      },
      template: `
        <div>
          <input type="checkbox" v-model.number="test" value="1">
          <input type="checkbox" v-model="test" value="2">
          <input type="checkbox" v-model.number="check">
        </div>
      `
    }).$mount()
    document.body.appendChild(vm.$el)
    var checkboxInputs = vm.$el.getElementsByTagName('input')
    expect(checkboxInputs[0].checked).toBe(false)
    expect(checkboxInputs[1].checked).toBe(false)
    expect(checkboxInputs[2].checked).toBe(true)
    checkboxInputs[0].click()
    checkboxInputs[1].click()
    checkboxInputs[2].click()
    expect(vm.test).toEqual([1, '2'])
    expect(vm.check).toEqual(false)
  })

  it('should respect different primitive type value', (done) => {
    const vm = new Vue({
      data: {
        test: [0]
      },
      template:
        '<div>' +
          '<input type="checkbox" value="" v-model="test">' +
          '<input type="checkbox" value="0" v-model="test">' +
          '<input type="checkbox" value="1" v-model="test">' +
        '</div>'
    }).$mount()
    var checkboxInput = vm.$el.children
    expect(checkboxInput[0].checked).toBe(false)
    expect(checkboxInput[1].checked).toBe(true)
    expect(checkboxInput[2].checked).toBe(false)
    vm.test = [1]
    waitForUpdate(() => {
      expect(checkboxInput[0].checked).toBe(false)
      expect(checkboxInput[1].checked).toBe(false)
      expect(checkboxInput[2].checked).toBe(true)
      vm.test = ['']
    }).then(() => {
      expect(checkboxInput[0].checked).toBe(true)
      expect(checkboxInput[1].checked).toBe(false)
      expect(checkboxInput[2].checked).toBe(false)
      vm.test = ['', 0, 1]
    }).then(() => {
      expect(checkboxInput[0].checked).toBe(true)
      expect(checkboxInput[1].checked).toBe(true)
      expect(checkboxInput[2].checked).toBe(true)
    }).then(done)
  })

  it('warn inline checked', () => {
    const vm = new Vue({
      template: `<input type="checkbox" v-model="test" checked>`,
      data: {
        test: false
      }
    }).$mount()
    expect(vm.$el.checked).toBe(false)
    expect('inline checked attributes will be ignored when using v-model').toHaveBeenWarned()
  })
})
