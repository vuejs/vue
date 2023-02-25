// @vitest-environment node
import path from 'path'
import { E2E_TIMEOUT, setupPuppeteer } from './e2eUtils'

describe('basic-ssr', () => {
  const { page, text } = setupPuppeteer()

  test(
    'should work',
    async () => {
      await page().goto(`file://${path.resolve(__dirname, `basic-ssr.html`)}`)
      expect(await text('#result')).toContain(
        `<div data-server-rendered="true">foo</div>`
      )
    },
    E2E_TIMEOUT
  )
})
