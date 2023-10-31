// @ts-check
import { defineComponent } from '../../index'
import { expectError, expectType, describe } from '../utils'
const props = {
  a: Number
}
describe('defineComponents works in js', () => {
  defineComponent({
    props,
    computed: {
      test() {
        /** @type import('../utils').IsAny<typeof this.a> */
        let test

        // @ts-expect-error
        expectType(/** @type {number | undefined} */ (test))

        // @ts-expect-error
        expectError(this.b)
      }
    }
  })
})
