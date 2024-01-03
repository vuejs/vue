import { setupPuppeteer, getExampleUrl, E2E_TIMEOUT } from './e2eUtils'

declare const globalStats: {
  label: string
  value: number
}[]

declare function valueToPoint(
  value: number,
  index: number,
  total: number
): {
  x: number
  y: number
}

describe('e2e: svg', () => {
  const { page, click, count, setValue, typeValue } = setupPuppeteer()

  // assert the shape of the polygon is correct
  async function assertPolygon(total: number) {
    expect(
      await page().evaluate(
        total => {
          const points = globalStats
            .map((stat, i) => {
              const point = valueToPoint(stat.value, i, total)
              return point.x + ',' + point.y
            })
            .join(' ')
          return (
            document.querySelector('polygon')!.attributes[0].value === points
          )
        },
        [total]
      )
    ).toBe(true)
  }

  // assert the position of each label is correct
  async function assertLabels(total: number) {
    const positions = await page().evaluate(
      total => {
        return globalStats.map((stat, i) => {
          const point = valueToPoint(+stat.value + 10, i, total)
          return [point.x, point.y]
        })
      },
      [total]
    )
    for (let i = 0; i < total; i++) {
      const textPosition = await page().$eval(
        `text:nth-child(${i + 3})`,
        node => [+node.attributes[0].value, +node.attributes[1].value]
      )
      expect(textPosition).toEqual(positions[i])
    }
  }

  // assert each value of stats is correct
  async function assertStats(expected: number[]) {
    const statsValue = await page().evaluate(() => {
      return globalStats.map(stat => +stat.value)
    })
    expect(statsValue).toEqual(expected)
  }

  function nthRange(n: number) {
    return `#demo div:nth-child(${n + 1}) input[type="range"]`
  }

  async function testSvg(apiType: 'classic' | 'composition') {
    await page().goto(getExampleUrl('svg', apiType))
    await page().waitForSelector('svg')
    expect(await count('g')).toBe(1)
    expect(await count('polygon')).toBe(1)
    expect(await count('circle')).toBe(1)
    expect(await count('text')).toBe(6)
    expect(await count('label')).toBe(6)
    expect(await count('button')).toBe(7)
    expect(await count('input[type="range"]')).toBe(6)
    await assertPolygon(6)
    await assertLabels(6)
    await assertStats([100, 100, 100, 100, 100, 100])

    await setValue(nthRange(1), '10')
    await assertPolygon(6)
    await assertLabels(6)
    await assertStats([10, 100, 100, 100, 100, 100])

    await click('button.remove')
    expect(await count('text')).toBe(5)
    expect(await count('label')).toBe(5)
    expect(await count('button')).toBe(6)
    expect(await count('input[type="range"]')).toBe(5)
    await assertPolygon(5)
    await assertLabels(5)
    await assertStats([100, 100, 100, 100, 100])

    await typeValue('input[name="newlabel"]', 'foo')
    await click('#add > button')
    expect(await count('text')).toBe(6)
    expect(await count('label')).toBe(6)
    expect(await count('button')).toBe(7)
    expect(await count('input[type="range"]')).toBe(6)
    await assertPolygon(6)
    await assertLabels(6)
    await assertStats([100, 100, 100, 100, 100, 100])

    await setValue(nthRange(1), '10')
    await assertPolygon(6)
    await assertLabels(6)
    await assertStats([10, 100, 100, 100, 100, 100])

    await setValue(nthRange(2), '20')
    await assertPolygon(6)
    await assertLabels(6)
    await assertStats([10, 20, 100, 100, 100, 100])

    await setValue(nthRange(6), '60')
    await assertPolygon(6)
    await assertLabels(6)
    await assertStats([10, 20, 100, 100, 100, 60])

    await click('button.remove')
    await assertPolygon(5)
    await assertLabels(5)
    await assertStats([20, 100, 100, 100, 60])

    await setValue(nthRange(1), '10')
    await assertPolygon(5)
    await assertLabels(5)
    await assertStats([10, 100, 100, 100, 60])
  }

  test(
    'classic',
    async () => {
      await testSvg('classic')
    },
    E2E_TIMEOUT
  )

  test(
    'composition',
    async () => {
      await testSvg('composition')
    },
    E2E_TIMEOUT
  )
})
