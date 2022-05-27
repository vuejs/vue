import Vue from '../index'

// object props
Vue.extend({
  props: {
    foo: String,
    bar: Number
  },
  setup(props) {
    props.foo + 'foo'
    props.bar + 123
  }
})

// array props
Vue.extend({
  props: ['foo', 'bar'],
  setup(props) {
    props.foo
    props.bar
  }
})

// context
Vue.extend({
  setup(_props, ctx) {
    if (ctx.attrs.id) {
    }
    ctx.emit('foo')
    ctx.slots.default && ctx.slots.default()
    ctx.expose({
      foo: 123
    })
  }
})
