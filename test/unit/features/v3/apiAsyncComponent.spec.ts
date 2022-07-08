import Vue from 'vue'
import { defineAsyncComponent, h, ref, nextTick, defineComponent } from 'v3'
import { Component } from 'types/component'

const timeout = (n: number = 0) => new Promise(r => setTimeout(r, n))

const loadingComponent = defineComponent({
  template: `<div>loading</div>`
})

const resolvedComponent = defineComponent({
  template: `<div>resolved</div>`
})

describe('api: defineAsyncComponent', () => {
  afterEach(() => {
    Vue.config.errorHandler = undefined
  })

  test('simple usage', async () => {
    let resolve: (comp: Component) => void
    const Foo = defineAsyncComponent(
      () =>
        new Promise(r => {
          resolve = r as any
        })
    )

    const toggle = ref(true)

    const vm = new Vue({
      render: () => (toggle.value ? h(Foo) : null)
    }).$mount()

    expect(vm.$el.nodeType).toBe(8)

    resolve!(resolvedComponent)
    // first time resolve, wait for macro task since there are multiple
    // microtasks / .then() calls
    await timeout()
    expect(vm.$el.innerHTML).toBe('resolved')

    toggle.value = false
    await nextTick()
    expect(vm.$el.nodeType).toBe(8)

    // already resolved component should update on nextTick
    toggle.value = true
    await nextTick()
    expect(vm.$el.innerHTML).toBe('resolved')
  })

  test('with loading component', async () => {
    let resolve: (comp: Component) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise(r => {
          resolve = r as any
        }),
      loadingComponent,
      delay: 1 // defaults to 200
    })

    const toggle = ref(true)

    const vm = new Vue({
      render: () => (toggle.value ? h(Foo) : null)
    }).$mount()

    // due to the delay, initial mount should be empty
    expect(vm.$el.nodeType).toBe(8)

    // loading show up after delay
    await timeout(1)
    expect(vm.$el.innerHTML).toBe('loading')

    resolve!(resolvedComponent)
    await timeout()
    expect(vm.$el.innerHTML).toBe('resolved')

    toggle.value = false
    await nextTick()
    expect(vm.$el.nodeType).toBe(8)

    // already resolved component should update on nextTick without loading
    // state
    toggle.value = true
    await nextTick()
    expect(vm.$el.innerHTML).toBe('resolved')
  })

  test('error with error component', async () => {
    let reject: (e: Error) => void
    const Foo = defineAsyncComponent({
      loader: () =>
        new Promise((_resolve, _reject) => {
          reject = _reject
        }),
      errorComponent: {
        template: `<div>errored</div>`
      }
    })

    const toggle = ref(true)

    const vm = new Vue({
      render: () => (toggle.value ? h(Foo) : null)
    }).$mount()

    expect(vm.$el.nodeType).toBe(8)

    const err = new Error('errored')
    reject!(err)
    await timeout()
    expect('Failed to resolve async').toHaveBeenWarned()
    expect(vm.$el.innerHTML).toBe('errored')

    toggle.value = false
    await nextTick()
    expect(vm.$el.nodeType).toBe(8)
  })

  test('retry (success)', async () => {
    let loaderCallCount = 0
    let resolve: (comp: Component) => void
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
      }
    })

    const vm = new Vue({
      render: () => h(Foo)
    }).$mount()

    expect(vm.$el.nodeType).toBe(8)
    expect(loaderCallCount).toBe(1)

    const err = new Error('foo')
    reject!(err)
    await timeout()
    expect(loaderCallCount).toBe(2)
    expect(vm.$el.nodeType).toBe(8)

    // should render this time
    resolve!(resolvedComponent)
    await timeout()
    expect(vm.$el.innerHTML).toBe('resolved')
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
      }
    })

    const vm = new Vue({
      render: () => h(Foo)
    }).$mount()

    expect(vm.$el.nodeType).toBe(8)
    expect(loaderCallCount).toBe(1)

    const err = new Error('foo')
    reject!(err)
    await timeout()
    // should fail because retryWhen returns false
    expect(loaderCallCount).toBe(1)
    expect(vm.$el.nodeType).toBe(8)
    expect('Failed to resolve async').toHaveBeenWarned()
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
      }
    })

    const vm = new Vue({
      render: () => h(Foo)
    }).$mount()

    expect(vm.$el.nodeType).toBe(8)
    expect(loaderCallCount).toBe(1)

    // first retry
    const err = new Error('foo')
    reject!(err)
    await timeout()
    expect(loaderCallCount).toBe(2)
    expect(vm.$el.nodeType).toBe(8)

    // 2nd retry, should fail due to reaching maxRetries
    reject!(err)
    await timeout()
    expect(loaderCallCount).toBe(2)
    expect(vm.$el.nodeType).toBe(8)
    expect('Failed to resolve async').toHaveBeenWarned()
  })
})
