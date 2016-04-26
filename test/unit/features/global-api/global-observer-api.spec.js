import Vue from 'vue'

describe('Global Data Observer API', () => {
  describe('Vue.set', () => {
    it('should update a vue object', done => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div>{{x}}</div>',
        data: { x: 1 }
      })
      expect(vm.$el.innerHTML).toBe('1')
      Vue.set(vm, 'x', 2)
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe('2')
        done()
      }).catch(done)
    })

    it('should update a observing object', done => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div>{{foo.x}}</div>',
        data: { foo: { x: 1 }}
      })
      expect(vm.$el.innerHTML).toBe('1')
      Vue.set(vm.foo, 'x', 2)
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe('2')
        done()
      }).catch(done)
    })

    it('should update a observing array', done => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div><div v-for="v,k in list">{{k}}-{{v}}</div></div>',
        data: { list: ['a', 'b', 'c'] }
      })
      expect(vm.$el.innerHTML).toBe('<div>0-a</div><div>1-b</div><div>2-c</div>')
      Vue.set(vm.list, 1, 'd')
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe('<div>0-a</div><div>1-d</div><div>2-c</div>')
        done()
      }).catch(done)
    })

    it('should update a vue object with nothing', done => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div>{{x}}</div>',
        data: { x: 1 }
      })
      expect(vm.$el.innerHTML).toBe('1')
      Vue.set(vm, 'x', null)
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe('')
        Vue.set(vm, 'x')
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('')
        done()
      }).catch(done)
    })
  })

  describe('Vue.delete', () => {
    it('should delete a key', done => {
      const vm = new Vue({
        el: document.createElement('div'),
        template: '<div>{{obj.x}}</div>',
        data: { obj: { x: 1 }}
      })
      expect(vm.$el.innerHTML).toBe('1')
      vm.obj.x = 2
      waitForUpdate(() => {
        expect(vm.$el.innerHTML).toBe('2')
        Vue.delete(vm.obj, 'x')
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('')
        vm.obj.x = 3
      }).then(() => {
        expect(vm.$el.innerHTML).toBe('')
        done()
      }).catch(done)
    })
  })
})
