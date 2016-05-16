import Vue from 'vue'

function assertClass (assertions, done) {
  const vm = new Vue({
    template: '<div class="foo" :class="value"></div>',
    data: { value: '' }
  }).$mount()
  var chain = waitForUpdate().catch(done)
  assertions.forEach(([value, expected], i) => {
    chain.then(() => {
      if (typeof value === 'function') {
        value(vm.value)
      } else {
        vm.value = value
      }
    }).then(() => {
      expect(vm.$el.className).toBe(expected)
      if (i >= assertions.length - 1) {
        done()
      }
    })
  })
}

describe('Directive v-bind:class', () => {
  it('plain string', done => {
    assertClass([
      ['bar', 'foo bar'],
      ['baz qux', 'foo baz qux'],
      ['qux', 'foo qux'],
      [undefined, 'foo']
    ], done)
  })

  it('object value', done => {
    assertClass([
      [{ bar: true, baz: false }, 'foo bar'],
      [{ baz: true }, 'foo baz'],
      [null, 'foo'],
      [{ 'bar baz': true, qux: false }, 'foo bar baz'],
      [{ qux: true }, 'foo qux']
    ], done)
  })

  it('array value', done => {
    assertClass([
      [['bar', 'baz'], 'foo bar baz'],
      [['qux', 'baz'], 'foo qux baz'],
      [['w', 'x y z'], 'foo w x y z'],
      [undefined, 'foo'],
      [['bar'], 'foo bar'],
      [val => val.push('baz'), 'foo bar baz']
    ], done)
  })

  it('array of mixed values', done => {
    assertClass([
      [['x', { y: true, z: true }], 'foo x y z'],
      [['x', { y: true, z: false }], 'foo x y'],
      [['f', { z: true }], 'foo f z'],
      [['l', 'f', { n: true, z: true }], 'foo l f n z'],
      [['x', {}], 'foo x'],
      [undefined, 'foo']
    ], done)
  })

  it('class merge between parent and child', done => {
    const vm = new Vue({
      template: '<child class="a" :class="value"></child>',
      data: { value: 'b' },
      components: {
        child: {
          template: '<div class="c" :class="value"></div>',
          data: () => ({ value: 'd' })
        }
      }
    }).$mount()
    const child = vm.$children[0]
    expect(vm.$el.className).toBe('c a d b')
    vm.value = 'e'
    waitForUpdate(() => {
      expect(vm.$el.className).toBe('c a d e')
    }).then(() => {
      child.value = 'f'
    }).then(() => {
      expect(vm.$el.className).toBe('c a f e')
    }).then(() => {
      vm.value = { foo: true }
      child.value = ['bar', 'baz']
    }).then(() => {
      expect(vm.$el.className).toBe('c a bar baz foo')
      done()
    }).catch(done)
  })
})
