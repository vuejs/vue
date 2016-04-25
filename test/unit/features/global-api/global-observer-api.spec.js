import Vue from 'vue'

describe('Global Data Observer API', () => {
  describe('Vue.set', () => {
    it('should update a vue object', (done) => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div>{{x}}</div>',
        data: {x: 1}
      })
      expect(vm.$el.innerHTML).toBe('1')
      Vue.set(vm, 'x', 2)
      Vue.nextTick(() => {
        expect(vm.$el.innerHTML).toBe('2')
        done()
      })
    })

    it('should update a observing object', (done) => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div>{{foo.x}}</div>',
        data: {foo: {x: 1}}
      })
      expect(vm.$el.innerHTML).toBe('1')
      Vue.set(vm.foo, 'x', 2)
      Vue.nextTick(() => {
        expect(vm.$el.innerHTML).toBe('2')
        done()
      })
    })

    it('should update a observing array', (done) => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div><div v-for="v,k in list">{{k}}-{{v}}</div></div>',
        data: {list: ['a', 'b', 'c']}
      })
      expect(vm.$el.innerHTML).toBe('<div>0-a</div><div>1-b</div><div>2-c</div>')
      Vue.set(vm.list, 1, 'd')
      Vue.nextTick(() => {
        expect(vm.$el.innerHTML).toBe('<div>0-a</div><div>1-d</div><div>2-c</div>')
        done()
      })
    })

    it('should update a vue object with nothing', (done) => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div>{{x}}</div>',
        data: {x: 1}
      })
      expect(vm.$el.innerHTML).toBe('1')
      Vue.set(vm, 'x', null)
      Vue.nextTick(() => {
        expect(vm.$el.innerHTML).toBe('')
        Vue.set(vm, 'x')
        Vue.nextTick(() => {
          expect(vm.$el.innerHTML).toBe('')
          done()
        })
      })
    })
  })

  describe('Vue.delete', () => {
    it('should delete a key', (done) => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div>{{x}}</div>',
        data: {x: 1}
      })
      expect(vm.$el.innerHTML).toBe('1')
      vm.x = 2
      Vue.nextTick(() => {
        expect(vm.$el.innerHTML).toBe('2')
        Vue.delete(vm, 'x')
        vm.x = 3
        Vue.nextTick(() => {
          expect(vm.$el.innerHTML).toBe('2')
          done()
        })
      })
    })
  })
})
