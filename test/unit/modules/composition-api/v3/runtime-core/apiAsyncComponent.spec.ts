import {
  h,
  createApp,
  defineAsyncComponent,
  nextTick,
  ref,
  defineComponent,
} from '../../../src'

const resolveComponent = {
  render() {
    return h('p', 'resolved')
  },
}

const loadingComponent = {
  render() {
    return h('p', 'loading')
  },
}

const errorComponent = defineComponent({
  render() {
    return h('p', 'errored out')
  },
})

const timeout = (n: number = 0) => new Promise((r) => setTimeout(r, n))

describe('api: defineAsyncComponent', () => {
  test('simple usage', async () => {
    const Foo = defineAsyncComponent(() =>
      Promise.resolve().then(() => resolveComponent)
    )

    const toggle = ref(true)

    const app = createApp({
      render: () => (toggle.value ? h(Foo) : null),
    })

    const vm = app.mount()

    expect(vm.$el.textContent).toBe('')

    // first time resolve, wait for macro task since there are multiple
    // microtasks / .then() calls
    await timeout()
    expect(vm.$el.textContent).toBe('resolved')

    toggle.value = false
    await nextTick()
    expect(vm.$el.textContent).toBe('')

    // already resolved component should update on nextTick
    toggle.value = true
    await nextTick()
    expect(vm.$el.textContent).toBe('resolved')
  })

  test('with loading component', async () => {
    let resolve: (cmp: any) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((res) => {
          resolve = res
        }),
      loadingComponent,
      delay: 1, // defaults to 200
    })

    const toggle = ref(true)

    const app = createApp({
      render: () => (toggle.value ? h(Foo) : null),
    })

    const vm = app.mount()

    // due to the delay, initial mount should be empty
    expect(vm.$el.textContent).toBe('')

    // loading show up after delay
    await timeout(2)
    expect(vm.$el.textContent).toBe('loading')

    resolve!(resolveComponent)
    await timeout()
    expect(vm.$el.textContent).toBe('resolved')

    toggle.value = false
    await nextTick()
    expect(vm.$el.textContent).toBe('')

    // already resolved component should update on nextTick without loading
    // state
    toggle.value = true
    await nextTick()
    expect(vm.$el.textContent).toBe('resolved')
  })

  test('with loading component + explicit delay (0)', async () => {
    let resolve: (comp: any) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((r) => {
          resolve = r as any
        }),
      loadingComponent,
      delay: 0,
    })

    const toggle = ref(true)

    const app = createApp({
      render: () => (toggle.value ? h(Foo) : null),
    })
    const vm = app.mount()

    // with delay: 0, should show loading immediately
    expect(vm.$el.textContent).toBe('loading')

    resolve!(resolveComponent)
    await timeout()
    expect(vm.$el.textContent).toBe('resolved')

    toggle.value = false
    await nextTick()
    expect(vm.$el.textContent).toBe('')

    // already resolved component should update on nextTick without loading
    // state
    toggle.value = true
    await nextTick()
    expect(vm.$el.textContent).toBe('resolved')
  })

  test('error without error component', async () => {
    // let resolve: (comp: any) => void
    let reject: (e: Error) => void
    const Foo = defineAsyncComponent(
      () =>
        new Promise((_resolve, _reject) => {
          // resolve = _resolve as any
          reject = _reject
        })
    )

    const toggle = ref(true)
    const app = createApp({
      render: () => (toggle.value ? h(Foo) : null),
    })

    const handler = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => null)

    const vm = app.mount()
    expect(vm.$el.textContent).toBe('')

    const err = new Error('foo')
    reject!(err)
    await timeout()
    expect(handler).toHaveBeenCalled()
    expect(handler.mock.calls[0][0]).toContain(err.message)
    expect(vm.$el.textContent).toBe('')

    toggle.value = false
    await nextTick()
    expect(vm.$el.textContent).toBe('')

    // This retry method doesn't work in Vue2

    // errored out on previous load, toggle and mock success this time
    // toggle.value = true
    // await nextTick()
    // expect(vm.$el.textContent).toBe('')

    // // should render this time
    // resolve!(resolveComponent)
    // await timeout()
    // expect(vm.$el.textContent).toBe('resolved')
  })

  test('error with error component', async () => {
    // let resolve: (comp: any) => void
    let reject: (e: Error) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((_resolve, _reject) => {
          // resolve = _resolve as any
          reject = _reject
        }),
      errorComponent,
    })

    const toggle = ref(true)

    const app = createApp({
      render: () => (toggle.value ? h(Foo) : null),
    })

    const handler = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => null)

    const vm = app.mount()
    expect(vm.$el.textContent).toBe('')

    const err = new Error('errored out')
    reject!(err)
    await timeout(1)
    expect(handler).toHaveBeenCalled()
    expect(vm.$el.textContent).toBe('errored out')

    toggle.value = false
    await nextTick()
    expect(vm.$el.textContent).toBe('')

    // This doesn't work in vue2
    // // errored out on previous load, toggle and mock success this time
    // toggle.value = true
    // await nextTick()
    // expect(vm.$el.textContent).toBe('')

    // // should render this time
    // resolve!(resolveComponent)
    // await timeout()
    // expect(vm.$el.textContent).toBe('resolved')
  })

  // #2129
  test('error with error component, without global handler', async () => {
    // let resolve: (comp: any) => void
    let reject: (e: Error) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((_resolve, _reject) => {
          // resolve = _resolve as any
          reject = _reject
        }),
      errorComponent,
    })

    const toggle = ref(true)
    const app = createApp({
      render: () => (toggle.value ? h(Foo) : null),
    })

    jest.spyOn(global.console, 'error').mockImplementation(() => null)

    const vm = app.mount()
    expect(vm.$el.textContent).toBe('')

    const err = new Error('errored out')
    reject!(err)
    await timeout()
    expect(vm.$el.textContent).toBe('errored out')
    // TODO: Warning check?
    // expect(
    //   'Unhandled error during execution of async component loader'
    // ).toHaveBeenWarned()

    toggle.value = false
    await nextTick()
    expect(vm.$el.textContent).toBe('')

    // this doesn't work in vue2
    // // errored out on previous load, toggle and mock success this time
    // toggle.value = true
    // await nextTick()
    // expect(vm.$el.textContent).toBe('')

    // // should render this time
    // resolve!(resolveComponent)
    // await timeout()
    // expect(vm.$el.textContent).toBe('resolved')
  })

  test('error with error + loading components', async () => {
    // let resolve: (comp: any) => void
    let reject: (e: Error) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((_resolve, _reject) => {
          // resolve = _resolve as any
          reject = _reject
        }),
      errorComponent,
      loadingComponent,
      delay: 1,
    })

    const toggle = ref(true)
    const app = createApp({
      render: () => (toggle.value ? h(Foo) : null),
    })

    const handler = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => null)

    const vm = app.mount()

    // due to the delay, initial mount should be empty
    expect(vm.$el.textContent).toBe('')

    // loading show up after delay
    await timeout(1)
    expect(vm.$el.textContent).toBe('loading')

    const err = new Error('errored out')
    reject!(err)
    await timeout()
    expect(handler).toHaveBeenCalled()
    expect(vm.$el.textContent).toBe('errored out')

    toggle.value = false
    await nextTick()
    expect(vm.$el.textContent).toBe('')

    // Not in vue2
    // // errored out on previous load, toggle and mock success this time
    // toggle.value = true
    // await nextTick()
    // expect(vm.$el.textContent).toBe('')

    // // loading show up after delay
    // await timeout(1)
    // expect(vm.$el.textContent).toBe('loading')

    // // should render this time
    // resolve!(resolveComponent)
    // await timeout()
    // expect(vm.$el.textContent).toBe('resolved')
  })

  test('timeout without error component', async () => {
    let resolve: (comp: any) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((_resolve) => {
          resolve = _resolve as any
        }),
      timeout: 1,
    })

    const app = createApp({
      render: () => h(Foo),
    })

    const handler = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => null)

    const vm = app.mount()
    expect(vm.$el.textContent).toBe('')

    await timeout(1)
    expect(handler).toHaveBeenCalled()
    // expect(handler.mock.calls[0][0].message).toContain(
    //   `Async component timed out after 1ms.`
    // )
    expect(vm.$el.textContent).toBe('')

    // if it resolved after timeout, should still work
    resolve!(resolveComponent)
    await timeout()
    expect(vm.$el.textContent).toBe('resolved')
  })

  test('timeout with error component', async () => {
    // let resolve: (comp: any) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((_resolve) => {
          // resolve = _resolve as any
        }),
      timeout: 1,
      errorComponent,
    })

    const app = createApp({
      render: () => h(Foo),
    })

    const handler = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => null)

    const vm = app.mount()
    expect(vm.$el.textContent).toBe('')

    await timeout(1)
    expect(handler).toHaveBeenCalled()
    expect(vm.$el.textContent).toBe('errored out')

    // Not in vue2
    // // if it resolved after timeout, should still work
    // resolve!(resolveComponent)
    // await timeout()
    // expect(vm.$el.textContent).toBe('resolved')
  })

  test('timeout with error + loading components', async () => {
    // let resolve: (comp: any) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((_resolve) => {
          // resolve = _resolve as any
        }),
      delay: 1,
      timeout: 16,
      errorComponent,
      loadingComponent,
    })

    const app = createApp({
      render: () => h(Foo),
    })
    const handler = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => null)
    const vm = app.mount()

    expect(vm.$el.textContent).toBe('')
    await timeout(1)
    expect(vm.$el.textContent).toBe('loading')

    await timeout(16)
    expect(vm.$el.textContent).toBe('errored out')
    expect(handler).toHaveBeenCalled()

    // Not in Vue2
    // resolve!(resolveComponent)
    // await timeout()
    // expect(vm.$el.textContent).toBe('resolved')
  })

  test('timeout without error component, but with loading component', async () => {
    let resolve: (comp: any) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((_resolve) => {
          resolve = _resolve as any
        }),
      delay: 1,
      timeout: 16,
      loadingComponent,
    })

    const app = createApp({
      render: () => h(Foo),
    })
    const handler = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => null)
    const vm = app.mount()
    expect(vm.$el.textContent).toBe('')
    await timeout(1)
    expect(vm.$el.textContent).toBe('loading')

    await timeout(16)
    expect(handler).toHaveBeenCalled()
    // expect(handler.mock.calls[0][0].message).toContain(
    //   `Async component timed out after 16ms.`
    // )
    // should still display loading
    expect(vm.$el.textContent).toBe('loading')

    resolve!(resolveComponent)
    await timeout()
    expect(vm.$el.textContent).toBe('resolved')
  })

  test('retry (success)', async () => {
    let loaderCallCount = 0
    let resolve: (comp: any) => void
    let reject: (e: Error) => void

    const Foo = defineAsyncComponent({
      loader: () => {
        loaderCallCount++
        return new Promise((_resolve, _reject) => {
          resolve = _resolve as any
          reject = _reject
        })
      },
      onError(error, retry, fail) {
        if (error.message.match(/foo/)) {
          retry()
        } else {
          fail()
        }
      },
    })

    const app = createApp({
      render: () => h(Foo),
    })

    jest.spyOn(global.console, 'error').mockImplementation(() => null)

    const vm = app.mount()
    expect(vm.$el.textContent).toBe('')
    expect(loaderCallCount).toBe(1)

    const err = new Error('foo')
    reject!(err)
    await timeout()
    // expect(handler).toHaveBeenCalled()
    expect(loaderCallCount).toBe(2)
    expect(vm.$el.textContent).toBe('')

    // should render this time
    resolve!(resolveComponent)
    await timeout()
    // expect(handler).not.toHaveBeenCalled()
    expect(vm.$el.textContent).toBe('resolved')
  })

  test('retry (skipped)', async () => {
    let loaderCallCount = 0
    let reject: (e: Error) => void

    const Foo = defineAsyncComponent({
      loader: () => {
        loaderCallCount++
        return new Promise((_resolve, _reject) => {
          reject = _reject
        })
      },
      onError(error, retry, fail) {
        if (error.message.match(/bar/)) {
          retry()
        } else {
          fail()
        }
      },
    })

    const app = createApp({
      render: () => h(Foo),
    })

    const handler = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => null)
    const vm = app.mount()
    expect(vm.$el.textContent).toBe('')
    expect(loaderCallCount).toBe(1)

    const err = new Error('foo')
    reject!(err)
    await timeout()
    // should fail because retryWhen returns false
    expect(handler).toHaveBeenCalled()
    expect(handler.mock.calls[0][0]).toContain(err.message)
    expect(loaderCallCount).toBe(1)
    expect(vm.$el.textContent).toBe('')
  })

  test('retry (fail w/ max retry attempts)', async () => {
    let loaderCallCount = 0
    let reject: (e: Error) => void

    const Foo = defineAsyncComponent({
      loader: () => {
        loaderCallCount++
        return new Promise((_resolve, _reject) => {
          reject = _reject
        })
      },
      onError(error, retry, fail, attempts) {
        if (error.message.match(/foo/) && attempts <= 1) {
          retry()
        } else {
          fail()
        }
      },
    })

    const app = createApp({
      render: () => h(Foo),
    })

    const handler = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => null)
    const vm = app.mount()
    expect(vm.$el.textContent).toBe('')
    expect(loaderCallCount).toBe(1)

    // first retry
    const err = new Error('foo')
    reject!(err)
    await timeout()
    // expect(handler).not.toHaveBeenCalled()
    expect(loaderCallCount).toBe(2)
    expect(vm.$el.textContent).toBe('')

    // 2nd retry, should fail due to reaching maxRetries
    reject!(err)
    await timeout()
    // expect(handler).toHaveBeenCalled()
    expect(handler.mock.calls[0][0]).toContain(err.message)
    expect(loaderCallCount).toBe(2)
    expect(vm.$el.textContent).toBe('')
  })

  // test('template ref forwarding', async () => {
  //   let resolve: (comp: Component) => void
  //   const Foo = defineAsyncComponent(
  //     () =>
  //       new Promise((r) => {
  //         resolve = r as any
  //       })
  //   )

  //   const fooRef = ref()
  //   const toggle = ref(true)
  //   const root = nodeOps.createElement('div')
  //   createApp({
  //     render: () => (toggle.value ? h(Foo, { ref: fooRef } as any) : null),
  //   }).mount(root)

  //   expect(vm.$el.textContent).toBe('')
  //   expect(fooRef.value).toBe(null)

  //   resolve!({
  //     data() {
  //       return {
  //         id: 'foo',
  //       }
  //     },
  //     render: resolveComponent.render,
  //   })
  //   // first time resolve, wait for macro task since there are multiple
  //   // microtasks / .then() calls
  //   await timeout()
  //   expect(vm.$el.textContent).toBe('resolved')
  //   expect(fooRef.value.id).toBe('foo')

  //   toggle.value = false
  //   await nextTick()
  //   expect(vm.$el.textContent).toBe('')
  //   expect(fooRef.value).toBe(null)

  //   // already resolved component should update on nextTick
  //   toggle.value = true
  //   await nextTick()
  //   expect(vm.$el.textContent).toBe('resolved')
  //   expect(fooRef.value.id).toBe('foo')
  // })
})
