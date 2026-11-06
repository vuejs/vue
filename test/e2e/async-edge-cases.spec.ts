// @vitest-environment node
import path from 'path'
import { E2E_TIMEOUT, setupPuppeteer } from './e2eUtils'

describe('basic-ssr', () => {
  const { page, text, click, isChecked } = setupPuppeteer()

  test(
    'should work',
    async () => {
      await page().goto(
        `file://${path.resolve(__dirname, `async-edge-cases.html`)}`
      )

      // #4510
      expect(await text('#case-1')).toContain('1')
      expect(await isChecked('#case-1 input')).toBe(false)

      await click('#case-1 input')
      expect(await text('#case-1')).toContain('2')
      expect(await isChecked('#case-1 input')).toBe(true)

      await click('#case-1 input')
      expect(await text('#case-1')).toContain('3')
      expect(await isChecked('#case-1 input')).toBe(false)

      // #6566
      expect(await text('#case-2 button')).toContain('Expand is True')
      expect(await text('.count-a')).toContain('countA: 0')
      expect(await text('.count-b')).toContain('countB: 0')

      await click('#case-2 button')
      expect(await text('#case-2 button')).toContain('Expand is False')
      expect(await text('.count-a')).toContain('countA: 1')
      expect(await text('.count-b')).toContain('countB: 0')

      await click('#case-2 button')
      expect(await text('#case-2 button')).toContain('Expand is True')
      expect(await text('.count-a')).toContain('countA: 1')
      expect(await text('.count-b')).toContain('countB: 1')
    },
    E2E_TIMEOUT
  )
})
