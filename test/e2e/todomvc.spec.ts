import { setupPuppeteer, getExampleUrl, E2E_TIMEOUT } from './e2eUtils'

describe('e2e: todomvc', () => {
  const {
    page,
    click,
    isVisible,
    count,
    text,
    value,
    isChecked,
    isFocused,
    classList,
    enterValue,
    clearValue
  } = setupPuppeteer()

  async function removeItemAt(n: number) {
    const item = (await page().$('.todo:nth-child(' + n + ')'))!
    const itemBBox = (await item.boundingBox())!
    await page().mouse.move(itemBBox.x + 10, itemBBox.y + 10)
    await click('.todo:nth-child(' + n + ') .destroy')
  }

  async function testTodomvc(apiType: 'classic' | 'composition') {
    const baseUrl = getExampleUrl('todomvc', apiType)
    await page().goto(baseUrl)
    expect(await isVisible('.main')).toBe(false)
    expect(await isVisible('.footer')).toBe(false)
    expect(await count('.filters .selected')).toBe(1)
    expect(await text('.filters .selected')).toBe('All')
    expect(await count('.todo')).toBe(0)

    await enterValue('.new-todo', 'test')
    expect(await count('.todo')).toBe(1)
    expect(await isVisible('.todo .edit')).toBe(false)
    expect(await text('.todo label')).toBe('test')
    expect(await text('.todo-count strong')).toBe('1')
    expect(await isChecked('.todo .toggle')).toBe(false)
    expect(await isVisible('.main')).toBe(true)
    expect(await isVisible('.footer')).toBe(true)
    expect(await isVisible('.clear-completed')).toBe(false)
    expect(await value('.new-todo')).toBe('')

    await enterValue('.new-todo', 'test2')
    expect(await count('.todo')).toBe(2)
    expect(await text('.todo:nth-child(2) label')).toBe('test2')
    expect(await text('.todo-count strong')).toBe('2')

    // toggle
    await click('.todo .toggle')
    expect(await count('.todo.completed')).toBe(1)
    expect(await classList('.todo:nth-child(1)')).toContain('completed')
    expect(await text('.todo-count strong')).toBe('1')
    expect(await isVisible('.clear-completed')).toBe(true)

    await enterValue('.new-todo', 'test3')
    expect(await count('.todo')).toBe(3)
    expect(await text('.todo:nth-child(3) label')).toBe('test3')
    expect(await text('.todo-count strong')).toBe('2')

    await enterValue('.new-todo', 'test4')
    await enterValue('.new-todo', 'test5')
    expect(await count('.todo')).toBe(5)
    expect(await text('.todo-count strong')).toBe('4')

    // toggle more
    await click('.todo:nth-child(4) .toggle')
    await click('.todo:nth-child(5) .toggle')
    expect(await count('.todo.completed')).toBe(3)
    expect(await text('.todo-count strong')).toBe('2')

    // remove
    await removeItemAt(1)
    expect(await count('.todo')).toBe(4)
    expect(await count('.todo.completed')).toBe(2)
    expect(await text('.todo-count strong')).toBe('2')
    await removeItemAt(2)
    expect(await count('.todo')).toBe(3)
    expect(await count('.todo.completed')).toBe(2)
    expect(await text('.todo-count strong')).toBe('1')

    // remove all
    await click('.clear-completed')
    expect(await count('.todo')).toBe(1)
    expect(await text('.todo label')).toBe('test2')
    expect(await count('.todo.completed')).toBe(0)
    expect(await text('.todo-count strong')).toBe('1')
    expect(await isVisible('.clear-completed')).toBe(false)

    // prepare to test filters
    await enterValue('.new-todo', 'test')
    await enterValue('.new-todo', 'test')
    await click('.todo:nth-child(2) .toggle')
    await click('.todo:nth-child(3) .toggle')

    // active filter
    await click('.filters li:nth-child(2) a')
    expect(await count('.todo')).toBe(1)
    expect(await count('.todo.completed')).toBe(0)
    // add item with filter active
    await enterValue('.new-todo', 'test')
    expect(await count('.todo')).toBe(2)

    // completed filter
    await click('.filters li:nth-child(3) a')
    expect(await count('.todo')).toBe(2)
    expect(await count('.todo.completed')).toBe(2)

    // filter on page load
    await page().goto(`${baseUrl}#active`)
    expect(await count('.todo')).toBe(2)
    expect(await count('.todo.completed')).toBe(0)
    expect(await text('.todo-count strong')).toBe('2')

    // completed on page load
    await page().goto(`${baseUrl}#completed`)
    expect(await count('.todo')).toBe(2)
    expect(await count('.todo.completed')).toBe(2)
    expect(await text('.todo-count strong')).toBe('2')

    // toggling with filter active
    await click('.todo .toggle')
    expect(await count('.todo')).toBe(1)
    await click('.filters li:nth-child(2) a')
    expect(await count('.todo')).toBe(3)
    await click('.todo .toggle')
    expect(await count('.todo')).toBe(2)

    // editing triggered by blur
    await click('.filters li:nth-child(1) a')
    await click('.todo:nth-child(1) label', { clickCount: 2 })
    expect(await count('.todo.editing')).toBe(1)
    expect(await isFocused('.todo:nth-child(1) .edit')).toBe(true)
    await clearValue('.todo:nth-child(1) .edit')
    await page().type('.todo:nth-child(1) .edit', 'edited!')
    await click('.new-todo') // blur
    expect(await count('.todo.editing')).toBe(0)
    expect(await text('.todo:nth-child(1) label')).toBe('edited!')

    // editing triggered by enter
    await click('.todo label', { clickCount: 2 })
    await enterValue('.todo:nth-child(1) .edit', 'edited again!')
    expect(await count('.todo.editing')).toBe(0)
    expect(await text('.todo:nth-child(1) label')).toBe('edited again!')

    // cancel
    await click('.todo label', { clickCount: 2 })
    await clearValue('.todo:nth-child(1) .edit')
    await page().type('.todo:nth-child(1) .edit', 'edited!')
    await page().keyboard.press('Escape')
    expect(await count('.todo.editing')).toBe(0)
    expect(await text('.todo:nth-child(1) label')).toBe('edited again!')

    // empty value should remove
    await click('.todo label', { clickCount: 2 })
    await enterValue('.todo:nth-child(1) .edit', ' ')
    expect(await count('.todo')).toBe(3)

    // toggle all
    await click('.toggle-all+label')
    expect(await count('.todo.completed')).toBe(3)
    await click('.toggle-all+label')
    expect(await count('.todo:not(.completed)')).toBe(3)
  }

  test(
    'classic',
    async () => {
      await testTodomvc('classic')
    },
    E2E_TIMEOUT
  )

  test(
    'composition',
    async () => {
      await testTodomvc('composition')
    },
    E2E_TIMEOUT
  )
})
