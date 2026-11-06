import { setupPuppeteer, getExampleUrl, E2E_TIMEOUT } from './e2eUtils'

interface TableData {
  name: string
  power: number
}

describe('e2e: grid', () => {
  const { page, click, text, count, typeValue, clearValue } = setupPuppeteer()
  const columns = ['name', 'power'] as const

  async function assertTable(data: TableData[]) {
    expect(await count('td')).toBe(data.length * columns.length)
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < columns.length; j++) {
        expect(
          await text(`tr:nth-child(${i + 1}) td:nth-child(${j + 1})`)
        ).toContain(`${data[i][columns[j]]}`)
      }
    }
  }

  async function testGrid(apiType: 'classic' | 'composition') {
    await page().goto(getExampleUrl('grid', apiType))
    await page().waitForSelector('table')
    expect(await count('th')).toBe(2)
    expect(await count('th.active')).toBe(0)
    expect(await text('th:nth-child(1)')).toContain('Name')
    expect(await text('th:nth-child(2)')).toContain('Power')
    await assertTable([
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ])

    await click('th:nth-child(1)')
    expect(await count('th.active:nth-child(1)')).toBe(1)
    expect(await count('th.active:nth-child(2)')).toBe(0)
    expect(await count('th:nth-child(1) .arrow.dsc')).toBe(1)
    expect(await count('th:nth-child(2) .arrow.dsc')).toBe(0)
    await assertTable([
      { name: 'Jet Li', power: 8000 },
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 }
    ])

    await click('th:nth-child(2)')
    expect(await count('th.active:nth-child(1)')).toBe(0)
    expect(await count('th.active:nth-child(2)')).toBe(1)
    expect(await count('th:nth-child(1) .arrow.dsc')).toBe(1)
    expect(await count('th:nth-child(2) .arrow.dsc')).toBe(1)
    await assertTable([
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Jet Li', power: 8000 },
      { name: 'Jackie Chan', power: 7000 }
    ])

    await click('th:nth-child(2)')
    expect(await count('th.active:nth-child(1)')).toBe(0)
    expect(await count('th.active:nth-child(2)')).toBe(1)
    expect(await count('th:nth-child(1) .arrow.dsc')).toBe(1)
    expect(await count('th:nth-child(2) .arrow.asc')).toBe(1)
    await assertTable([
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Jet Li', power: 8000 },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Chuck Norris', power: Infinity }
    ])

    await click('th:nth-child(1)')
    expect(await count('th.active:nth-child(1)')).toBe(1)
    expect(await count('th.active:nth-child(2)')).toBe(0)
    expect(await count('th:nth-child(1) .arrow.asc')).toBe(1)
    expect(await count('th:nth-child(2) .arrow.asc')).toBe(1)
    await assertTable([
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ])

    await typeValue('input[name="query"]', 'j')
    await assertTable([
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ])

    await typeValue('input[name="query"]', 'infinity')
    await assertTable([{ name: 'Chuck Norris', power: Infinity }])

    await clearValue('input[name="query"]')
    expect(await count('p')).toBe(0)
    await typeValue('input[name="query"]', 'stringthatdoesnotexistanywhere')
    expect(await count('p')).toBe(1)
  }

  test(
    'classic',
    async () => {
      await testGrid('classic')
    },
    E2E_TIMEOUT
  )

  test(
    'composition',
    async () => {
      await testGrid('composition')
    },
    E2E_TIMEOUT
  )
})
