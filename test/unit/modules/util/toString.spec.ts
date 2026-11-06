import { toString } from 'core/util/index'
import { ref } from 'v3'

test('should unwrap refs', () => {
  expect(
    toString({
      a: ref(0),
      b: { c: ref(1) }
    })
  ).toBe(JSON.stringify({ a: 0, b: { c: 1 } }, null, 2))
})
