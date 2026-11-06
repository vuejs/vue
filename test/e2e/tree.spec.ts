import { setupPuppeteer, getExampleUrl, E2E_TIMEOUT } from './e2eUtils'

describe('e2e: tree', () => {
  const { page, click, count, text, childrenCount, isVisible } =
    setupPuppeteer()

  async function testTree(apiType: 'classic' | 'composition') {
    await page().goto(getExampleUrl('tree', apiType))
    expect(await count('.item')).toBe(12)
    expect(await count('.add')).toBe(4)
    expect(await count('.item > ul')).toBe(4)
    expect(await isVisible('#demo li ul')).toBe(false)
    expect(await text('#demo li div span')).toBe('[+]')

    // expand root
    await click('.bold')
    expect(await isVisible('#demo ul')).toBe(true)
    expect(await childrenCount('#demo li ul')).toBe(4)
    expect(await text('#demo li div span')).toContain('[-]')
    expect(await text('#demo > .item > ul > .item:nth-child(1)')).toContain(
      'hello'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(2)')).toContain(
      'wat'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(3)')).toContain(
      'child folder'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(3)')).toContain(
      '[+]'
    )

    // add items to root
    await click('#demo > .item > ul > .add')
    expect(await childrenCount('#demo li ul')).toBe(5)
    expect(await text('#demo > .item > ul > .item:nth-child(1)')).toContain(
      'hello'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(2)')).toContain(
      'wat'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(3)')).toContain(
      'child folder'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(3)')).toContain(
      '[+]'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(4)')).toContain(
      'new stuff'
    )

    // add another item
    await click('#demo > .item > ul > .add')
    expect(await childrenCount('#demo li ul')).toBe(6)
    expect(await text('#demo > .item > ul > .item:nth-child(1)')).toContain(
      'hello'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(2)')).toContain(
      'wat'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(3)')).toContain(
      'child folder'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(3)')).toContain(
      '[+]'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(4)')).toContain(
      'new stuff'
    )
    expect(await text('#demo > .item > ul > .item:nth-child(5)')).toContain(
      'new stuff'
    )

    await click('#demo ul .bold')
    expect(await isVisible('#demo ul ul')).toBe(true)
    expect(await text('#demo ul > .item:nth-child(3)')).toContain('[-]')
    expect(await childrenCount('#demo ul ul')).toBe(5)

    await click('.bold')
    expect(await isVisible('#demo ul')).toBe(false)
    expect(await text('#demo li div span')).toContain('[+]')
    await click('.bold')
    expect(await isVisible('#demo ul')).toBe(true)
    expect(await text('#demo li div span')).toContain('[-]')

    await click('#demo ul > .item div', { clickCount: 2 })
    expect(await count('.item')).toBe(15)
    expect(await count('.item > ul')).toBe(5)
    expect(await text('#demo ul > .item:nth-child(1)')).toContain('[-]')
    expect(await childrenCount('#demo ul > .item:nth-child(1) > ul')).toBe(2)
  }

  test(
    'classic',
    async () => {
      await testTree('classic')
    },
    E2E_TIMEOUT
  )

  test(
    'composition',
    async () => {
      await testTree('composition')
    },
    E2E_TIMEOUT
  )
})
