import { defineAsyncComponent } from '../../v3-define-async-component'
import { defineComponent } from '../../v3-define-component'

defineAsyncComponent(() => Promise.resolve({}))

// @ts-expect-error
defineAsyncComponent({})

defineAsyncComponent({
  loader: () => Promise.resolve({}),
  loadingComponent: defineComponent({}),
  errorComponent: defineComponent({}),
  delay: 123,
  timeout: 3000,
  onError(err, retry, fail, attempts) {
    retry()
    fail()
  }
})
