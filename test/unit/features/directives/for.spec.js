import Vue from 'vue'

describe('Directive v-for', () => {
  it('should travel array of primitive values', done => {
    const vm = new Vue({
      el: '#app',
      template: `
        <div>
          <span v-for="(i, item) in list">{{i}}-{{item}}</span>
        </div>
      `,
      data: {
        list: ['a', 'b', 'c']
      }
    })
    expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
    Vue.set(vm.list, 0, 'd')
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-b</span><span>2-c</span>')
      vm.list.push('d')
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-b</span><span>2-c</span><span>3-d</span>')
      vm.list.splice(1, 2)
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-d</span>')
      vm.list = ['x', 'y']
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-x</span><span>1-y</span>')
      done()
    }).catch(done)
  })

  it('should travel array of object values', done => {
    const vm = new Vue({
      el: '#app',
      template: `
        <div>
          <span v-for="(i, item) in list">{{i}}-{{item.value}}</span>
        </div>
      `,
      data: {
        list: [
          { value: 'a' },
          { value: 'b' },
          { value: 'c' }
        ]
      }
    })
    expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
    Vue.set(vm.list, 0, { value: 'd' })
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-d</span><span>1-b</span><span>2-c</span>')
      vm.list[0].value = 'e'
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-e</span><span>1-b</span><span>2-c</span>')
      vm.list.push({})
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-e</span><span>1-b</span><span>2-c</span><span>3-</span>')
      vm.list.splice(1, 2)
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-e</span><span>1-</span>')
      vm.list = [{ value: 'x' }, { value: 'y' }]
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>0-x</span><span>1-y</span>')
      done()
    }).catch(done)
  })

  it('should travel each key of an object', done => {
    const vm = new Vue({
      el: '#app',
      template: `
        <div>
          <span v-for="(k, v) in obj">{{v}}-{{k}}</span>
        </div>
      `,
      data: {
        obj: { a: 0, b: 1, c: 2 }
      }
    })
    expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
    vm.obj.a = 3
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span>')
      Vue.set(vm.obj, 'd', 4)
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span><span>4-d</span>')
      Vue.delete(vm.obj, 'a')
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>1-b</span><span>2-c</span><span>4-d</span>')
      done()
    }).catch(done)
  })

  it('should travel each key of data', done => {
    const vm = new Vue({
      el: '#app',
      template: `
        <div>
          <span v-for="(k, v) in $data">{{v}}-{{k}}</span>
        </div>
      `,
      data: { a: 0, b: 1, c: 2 }
    })
    expect(vm.$el.innerHTML).toBe('<span>0-a</span><span>1-b</span><span>2-c</span>')
    vm.a = 3
    waitForUpdate(() => {
      expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span>')
      Vue.set(vm, 'd', 4)
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>3-a</span><span>1-b</span><span>2-c</span><span>4-d</span>')
      Vue.delete(vm, 'a')
    }).then(() => {
      expect(vm.$el.innerHTML).toBe('<span>1-b</span><span>2-c</span><span>4-d</span>')
      done()
    }).catch(done)
  })
})
