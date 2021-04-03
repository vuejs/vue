import Vue from 'vue'
import CompositionApi from '../src'
import { createLocalVue } from './helpers/create-local-vue'
import { mockWarn } from './helpers'

describe('use', () => {
  mockWarn(true)

  it('should allow install in multiple vue', () => {
    const localVueOne = createLocalVue()
    localVueOne.use(CompositionApi)

    const localVueTwo = createLocalVue()
    localVueTwo.use(CompositionApi)

    expect(
      '[vue-composition-api] another instance of Vue installed'
    ).not.toHaveBeenWarned()
  })

  it('should warn install in multiple vue', () => {
    try {
      const fakeVue = {
        version: '2._.x',
        config: {
          optionMergeStrategies: {},
        },
        mixin: jest.fn(),
      }

      // @ts-ignore
      CompositionApi.install(fakeVue)
      expect(
        '[vue-composition-api] another instance of Vue installed'
      ).toHaveBeenWarned()
    } finally {
      Vue.use(CompositionApi)
      expect(
        '[vue-composition-api] another instance of Vue installed'
      ).toHaveBeenWarned()
    }
  })

  it('should warn installing multiple times', () => {
    const localVueOne = createLocalVue()
    localVueOne.use(CompositionApi)

    // vue prevents the same plugin of being installed, this will create a new plugin instance
    localVueOne.use({
      install(v) {
        CompositionApi.install(v)
      },
    })

    expect(
      '[vue-composition-api] already installed. Vue.use(VueCompositionAPI) should be called only once.'
    ).toHaveBeenWarned()
  })
})
