import Vue from 'vue'

function assertStyle (expr, assertions, done) {
  const vm = new Vue({
    template: `<div :style="${expr}"></div>`,
    data: { value: '' }
  }).$mount()
  const chain = waitForUpdate()
  assertions.forEach(([value, expected], i) => {
    chain.then(() => {
      if (typeof value === 'function') {
        value(vm.value)
      } else {
        vm.value = value
      }
    }).then(() => {
      for (const key in expected) {
        expect(vm.$el.style[key]).toBe(expected[key])
      }
      if (i >= assertions.length - 1) {
        done()
      }
    })
  })
  chain.then(done)
}

function checkPrefixedProp (prop) {
  const el = document.createElement('div')
  const upper = prop.charAt(0).toUpperCase() + prop.slice(1)
  if (!(prop in el.style)) {
    const prefixes = ['webkit', 'moz', 'ms']
    let i = prefixes.length
    while (i--) {
      if ((prefixes[i] + upper) in el.style) {
        return prefixes[i] + upper
      }
    }
  }
}

describe('Directive v-bind:style', () => {
  it('object syntax', done => {
    const style = '{ color: value.color, fontSize: value.size + \'px\' }'
    assertStyle(style, [
      [{}, { color: '', fontSize: '' }],
      [{ color: 'blue' }, { color: 'blue', fontSize: '' }],
      [{ size: 10 }, { color: '', fontSize: '10px' }]
    ], done)
  })

  it('object syntax with kebab-case', done => {
    const style = '{ color: value.color, \'font-size\': value.size + \'px\' }'
    assertStyle(style, [
      [{}, { color: '', fontSize: '' }],
      [{ color: 'blue' }, { color: 'blue', fontSize: '' }],
      [{ size: 10 }, { color: '', fontSize: '10px' }]
    ], done)
  })

  it('object name syntax', done => {
    const style = 'value'
    assertStyle(style, [
      [{}, { color: '', fontSize: '' }],
      [{ color: 'blue' }, { color: 'blue', fontSize: '' }],
      [{ fontSize: '10px' }, { color: '', fontSize: '10px' }],
      [{ color: 'blue', fontSize: '10px' }, { color: 'blue', fontSize: '10px' }]
    ], done)
  })

  it('array syntax', done => {
    const style = '[ value.foo, value.bar ]'
    assertStyle(style, [
      [{}, { color: '', fontSize: '' }],
      [{ foo: { color: 'blue' }}, { color: 'blue', fontSize: '' }],
      [{ bar: { fontSize: '10px' }}, { color: '', fontSize: '10px' }],
      [
        { foo: { color: 'blue' }, bar: { fontSize: '10px' }},
        { color: 'blue', fontSize: '10px' }
      ]
    ], done)
  })

  it('auto prefixing', done => {
    // http://peter.sh/experiments/vendor-prefixed-css-property-overview/
    // Chrome 50 works well
    const style = 'value'
    const propName = checkPrefixedProp('userSelect')
    if (propName) {
      assertStyle(style, [
        [{}, { [propName]: '' }],
        [{ userSelect: 'auto' }, { [propName]: 'auto' }]
      ], done)
    }
  })
})
