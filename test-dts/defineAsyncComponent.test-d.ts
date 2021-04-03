import { AsyncComponent } from 'vue'
import { defineAsyncComponent, defineComponent, expectType } from './index'

function asyncComponent1() {
  return Promise.resolve().then(() => {
    return defineComponent({})
  })
}

function asyncComponent2() {
  return Promise.resolve().then(() => {
    return {
      template: 'ASYNC',
    }
  })
}

const syncComponent1 = defineComponent({
  template: '',
})

const syncComponent2 = {
  template: '',
}

defineAsyncComponent(asyncComponent1)
defineAsyncComponent(asyncComponent2)

defineAsyncComponent({
  loader: asyncComponent1,
  delay: 200,
  timeout: 3000,
  errorComponent: syncComponent1,
  loadingComponent: syncComponent1,
})

defineAsyncComponent({
  loader: asyncComponent2,
  delay: 200,
  timeout: 3000,
  errorComponent: syncComponent2,
  loadingComponent: syncComponent2,
})

defineAsyncComponent(
  () =>
    new Promise((resolve, reject) => {
      resolve(syncComponent1)
    })
)

defineAsyncComponent(
  () =>
    new Promise((resolve, reject) => {
      resolve(syncComponent2)
    })
)

const component = defineAsyncComponent({
  loader: asyncComponent1,
  loadingComponent: defineComponent({}),
  errorComponent: defineComponent({}),
  delay: 200,
  timeout: 3000,
  suspensible: false,
  onError(error, retry, fail, attempts) {
    expectType<() => void>(retry)
    expectType<() => void>(fail)
    expectType<number>(attempts)
    expectType<Error>(error)
  },
})

expectType<AsyncComponent>(component)
