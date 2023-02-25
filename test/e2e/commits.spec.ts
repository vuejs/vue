// @vitest-environment node
import { setupPuppeteer, getExampleUrl, E2E_TIMEOUT } from './e2eUtils'
import mocks from './commits.mock'

describe('e2e: commits', () => {
  const { page, click, count, text, isChecked } = setupPuppeteer()

  async function testCommits(apiType: 'classic' | 'composition') {
    // intercept and mock the response to avoid hitting the actual API
    await page().setRequestInterception(true)
    page().on('request', req => {
      const match = req.url().match(/&sha=(.*)$/)
      if (!match) {
        req.continue()
      } else {
        const ret = JSON.stringify(mocks[match[1] as 'main' | 'dev'])
        req.respond({
          status: 200,
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: ret
        })
      }
    })

    await page().goto(getExampleUrl('commits', apiType))
    await page().waitForSelector('li')

    expect(await count('input')).toBe(2)
    expect(await count('label')).toBe(2)
    expect(await text('label[for="main"]')).toBe('main')
    expect(await text('label[for="dev"]')).toBe('dev')
    expect(await isChecked('#main')).toBe(true)
    expect(await isChecked('#dev')).toBe(false)
    expect(await text('p')).toBe('vuejs/vue@main')
    expect(await count('li')).toBe(3)
    expect(await count('li .commit')).toBe(3)
    expect(await count('li .message')).toBe(3)

    await click('#dev')
    expect(await text('p')).toBe('vuejs/vue@dev')
    expect(await count('li')).toBe(3)
    expect(await count('li .commit')).toBe(3)
    expect(await count('li .message')).toBe(3)
  }

  test(
    'classic',
    async () => {
      await testCommits('classic')
    },
    E2E_TIMEOUT
  )

  test(
    'composition',
    async () => {
      await testCommits('composition')
    },
    E2E_TIMEOUT
  )
})
