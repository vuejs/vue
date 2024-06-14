// @ts-check
import { defineComponent } from '../../index'
import { expectError, describe } from '../utils'
const props = {
  a: Number
}
describe('defineComponent prop types work in js', () => {
  defineComponent({
    props,
    computed: {
      test() {
        // @ts-expect-error Invalid typecast if `this.a` is not any
        ;/** @type import('../utils').IsAny<typeof this.a> */ (this.a)

        // @ts-expect-error Unknown property
        expectError(this.b)
      }
    }
  })
})
