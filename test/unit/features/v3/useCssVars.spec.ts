import Vue from 'vue'
import { useCssVars, h, reactive, nextTick } from 'v3'

describe('useCssVars', () => {
  async function assertCssVars(getApp: (state: any) => any) {
    const state = reactive({ color: 'red' })
    const App = getApp(state)
    const vm = new Vue(App).$mount()
    await nextTick()
    expect((vm.$el as HTMLElement).style.getPropertyValue(`--color`)).toBe(
      `red`
    )

    state.color = 'green'
    await nextTick()
    expect((vm.$el as HTMLElement).style.getPropertyValue(`--color`)).toBe(
      `green`
    )
  }

  test('basic', async () => {
    await assertCssVars(state => ({
      setup() {
        // test receiving render context
        useCssVars(vm => ({
          color: vm.color
        }))
        return state
      },
      render() {
        return h('div')
      }
    }))
  })

  test('on HOCs', async () => {
    const Child = {
      render: () => h('div')
    }

    await assertCssVars(state => ({
      setup() {
        useCssVars(() => state)
        return () => h(Child)
      }
    }))
  })
})
