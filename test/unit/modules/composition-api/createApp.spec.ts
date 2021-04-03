import { createApp, defineComponent, ref, nextTick } from '../src'

describe('createApp', () => {
  it('should work', async () => {
    const app = createApp({
      setup() {
        return {
          a: ref(1),
        }
      },
      template: '<p>{{a}}</p>',
    })
    const vm = app.mount()

    await nextTick()
    expect(vm.$el.textContent).toBe('1')
  })

  it('should work with rootProps', async () => {
    const app = createApp(
      defineComponent({
        props: {
          msg: String,
        },
        template: '<p>{{msg}}</p>',
      }),
      {
        msg: 'foobar',
      }
    )
    const vm = app.mount()

    await nextTick()
    expect(vm.$el.textContent).toBe('foobar')
  })

  it('should work with components', async () => {
    const Foo = defineComponent({
      props: {
        msg: {
          type: String,
          required: true,
        },
      },
      template: '<p>{{msg}}</p>',
    })

    const app = createApp(
      defineComponent({
        props: {
          msg: String,
        },
        template: '<Foo :msg="msg"/>',
      }),
      {
        msg: 'foobar',
      }
    )
    app.component('Foo', Foo)
    const vm = app.mount()

    await nextTick()
    expect(vm.$el.textContent).toBe('foobar')
  })
})
