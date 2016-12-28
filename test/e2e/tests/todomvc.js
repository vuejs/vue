import { TodomvcPage } from '../page-models'

fixture `TodoMVC`
    .page('http://localhost:8080/examples/todomvc/#test')

const page = new TodomvcPage()
const { newTodo, items, footer } = page

test('todomvc', async t => {
    await t
        .expect(items.container.visible).notOk()
        .expect(footer.container.visible).notOk()
        .expect(footer.filters.getSelected().count).eql(1)
        .expect(footer.filters.getSelected().textContent).eql('All')

    await items.createNewItem(t, 'test')
    await t
        .expect(items.all.count).eql(1)
        .expect(items.getEdit(0).visible).notOk()
        .expect(items.getLabel(0).textContent).contains('test')
        .expect(footer.countLeftItems.textContent).contains('1')
        .expect(items.getCheckbox(0).checked).notOk()
        .expect(items.container.visible).ok()
        .expect(footer.container.visible).ok()
        .expect(footer.clearCompleted.visible).notOk()
        .expect(newTodo.value).eql('')

    await items.createNewItem(t, 'test2')
    await t
        .expect(items.all.count).eql(2)
        .expect(items.getLabel(1).textContent).contains('test2')
        .expect(footer.countLeftItems.textContent).contains('2')

        // toggle
        .click(items.getCheckbox(0))
        .expect(items.completed.count).eql(1)
        .expect(items.all.nth(0).hasClass('completed')).ok()
        .expect(footer.countLeftItems.textContent).contains('1')
        .expect(footer.clearCompleted.visible).ok()

    await items.createNewItem(t, 'test3')
    await t
        .expect(items.all.count).eql(3)
        .expect(items.getLabel(2).textContent).contains('test3')
        .expect(footer.countLeftItems.textContent).contains('2')

    await items.createNewItem(t, 'test4')
    await items.createNewItem(t, 'test5')
    await t
        .expect(items.all.count).eql(5)
        .expect(footer.countLeftItems.textContent).contains('4')

        // toggle more
        .click(items.getCheckbox(3))
        .click(items.getCheckbox(4))
        .expect(items.completed.count).eql(3)
        .expect(footer.countLeftItems.textContent).contains('2')

    // remove
    await items.removeItemAt(t, 0)
    await t
        .expect(items.all.count).eql(4)
        .expect(items.completed.count).eql(2)
        .expect(footer.countLeftItems.textContent).contains('2')

    await items.removeItemAt(t, 1)
    await t
        .expect(items.completed.count).eql(2)
        .expect(footer.countLeftItems.textContent).contains('1')

        // remove all
        .click(footer.clearCompleted)
        .expect(items.all.count).eql(1)
        .expect(items.getLabel(0).textContent).contains('test2')
        .expect(items.completed.count).eql(0)
        .expect(footer.countLeftItems.textContent).contains('1')
        .expect(footer.clearCompleted.visible).notOk()

    // prepare to test filters
    await items.createNewItem(t, 'test')
    await items.createNewItem(t, 'test')
    await t
        .click(items.getCheckbox(1))
        .click(items.getCheckbox(2))

        // active filter
        .click(footer.filters.active)
        .expect(items.all.count).eql(1)
        .expect(items.completed.count).eql(0)

    await items.createNewItem(t, 'test')
    await t
        .expect(items.all.count).eql(2)

        // complted filter
        .click(footer.filters.completed)
        .expect(items.all.count).eql(2)
        .expect(items.completed.count).eql(2)

        // filter on page load
        .navigateTo('http://localhost:8080/examples/todomvc/#active')
        .expect(items.all.count).eql(2)
        .expect(items.completed.count).eql(0)
        .expect(footer.countLeftItems.textContent).contains('2')

        // completed on page load
        .navigateTo('http://localhost:8080/examples/todomvc/#completed')
        .expect(items.all.count).eql(2)
        .expect(items.completed.count).eql(2)
        .expect(footer.countLeftItems.textContent).contains('2')

        // toggling with filter active
        .click(items.getCheckbox(0))
        .expect(items.all.count).eql(1)
        .click(footer.filters.active)
        .expect(items.all.count).eql(3)
        .click(items.getCheckbox(0))

        // editing triggered by blur
        .click(footer.filters.all)
        .doubleClick(items.getLabel(0))
        .expect(items.getEdit(0).focused).ok()

        .typeText(items.getEdit(0), 'edited!', { replace: true })
        .click(footer.container, { offsetX: 0, offsetY: 0 }) // blur
        .expect(items.edited.exists).notOk()
        .expect(items.getLabel(0).textContent).contains('edited!')

        // editing triggered by enter
        .doubleClick(items.getLabel(0))
        .typeText(items.getEdit(0), 'edited again!', { replace: true })
        .pressKey('enter')
        .expect(items.edited.exists).notOk()
        .expect(items.getLabel(0).textContent).contains('edited again!')

        // cancel
        .doubleClick(items.getLabel(0))
        .typeText(items.getEdit(0), 'edited!')
        .pressKey('esc')
        .expect(items.edited.exists).notOk()
        .expect(items.getLabel(0).textContent).contains('edited again!')

        // empty value should remove
        .doubleClick(items.getLabel(0))
        .typeText(items.getEdit(0), ' ', { replace: true })
        .pressKey('enter')
        .expect(items.all.count).eql(3)

        // toggle all
        .click(items.toggleAll)
        .expect(items.completed.count).eql(3)
        .click(items.toggleAll)
        .expect(items.completed.count).eql(0)
})
