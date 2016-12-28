import { GridPage } from '../page-models'
import { assertTable } from '../testing-helpers'
import gridManipulationResults from '../grid-manipulation-results'

fixture `Grid`
    .page('http://localhost:8080/examples/grid/')

const page = new GridPage()
const { table, query, noMatchesFound } = page

test('grid', async t => {
    await t
        .expect(table.find('th').count).eql(2)
        .expect(table.find('th.active').count).eql(0)
        .expect(table.find('th:nth-child(1)').textContent).contains('Name')
        .expect(table.find('th:nth-child(2)').textContent).contains('Power')
    await assertTable(t, table, gridManipulationResults.defaultSort)

    await t.click(table.find('th').nth(0))
    await assertTable(t, table, gridManipulationResults.byNameDesc)

    await t.click(table.find('th').nth(1))
    await assertTable(t, table, gridManipulationResults.byPowerAsc)

    await t.click(table.find('th').nth(1))
    await assertTable(t, table, gridManipulationResults.byPowerDesc)

    await t.click(table.find('th').nth(0))
    await assertTable(t, table, gridManipulationResults.byNameAsc)

    await t.typeText(query, 'infinity')
    await assertTable(t, table, gridManipulationResults.filterByName)

    await t
        .pressKey('ctrl+a delete')
        .expect(noMatchesFound.count).eql(0)

        .typeText(query, 'stringthatdoesnotexistanywhere')
        .expect(noMatchesFound.count).eql(1)
})

