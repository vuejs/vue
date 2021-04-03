const Vue = require('vue/dist/vue.common.js')
const { ref, watchEffect } = require('../src')

describe('ref', () => {
  it('should work', (done) => {
    let dummy
    const vm = new Vue({
      setup() {
        const ref1 = ref(null)
        watchEffect(() => {
          dummy = ref1.value
        })

        return {
          bar: ref1,
        }
      },
      template: `<div>
        <test ref="bar"></test>
      </div>`,
      components: {
        test: {
          id: 'test',
          template: '<div>test</div>',
        },
      },
    }).$mount()
    vm.$nextTick()
      .then(() => {
        expect(dummy).toBe(vm.$refs.bar)
      })
      .then(done)
  })

  it('should dynamically update refs', (done) => {
    const vm = new Vue({
      setup() {
        const ref1 = ref(null)
        const ref2 = ref(null)
        watchEffect(() => {
          dummy1 = ref1.value
          dummy2 = ref2.value
        })

        return {
          value: 'bar',
          bar: ref1,
          foo: ref2,
        }
      },
      template: '<div :ref="value"></div>',
    }).$mount()
    waitForUpdate(() => {})
      .then(() => {
        expect(dummy1).toBe(vm.$refs.bar)
        expect(dummy2).toBe(null)
        vm.value = 'foo'
      })
      .then(() => {
        // vm updated. ref update occures after updated;
      })
      .then(() => {
        // no render cycle, empty tick
      })
      .then(() => {
        expect(dummy1).toBe(null)
        expect(dummy2).toBe(vm.$refs.foo)
      })
      .then(done)
  })

  // TODO: how ?
  // it('work with createElement', () => {
  //   let root;
  //   const vm = new Vue({
  //     setup() {
  //       root = ref(null);
  //       return () => {
  //         return h('div', {
  //           ref: root,
  //         });
  //       };
  //     },
  //   }).$mount();
  //   expect(root.value).toBe(vm.$el);
  // });
})
