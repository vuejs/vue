import { ClientFunction } from 'testcafe'

export async function assertTable (t, table, expectedData) {
    const columns = ['name', 'power']

    await t.expect(table.find('td').count, expectedData.length * columns.length)

    let currentTdText = null
    let expectedText = null

    for (let i = 0; i < expectedData.length; i++) {
        for (let j = 0; j < columns.length; j++) {
            currentTdText = await table.find('tbody').find('tr').nth(i).find('td').nth(j).textContent
            expectedText = expectedData[i][columns[j]]

            await t.expect(currentTdText).contains(expectedText)
        }
    }
}

export async function assertPoligonPoints (t, countPoint) {
    const checkPolygonPoints = ClientFunction(() => {
        /* eslint-disable no-undef */
        var points = stats.map(function (stat, i) {
            var point = valueToPoint(stat.value, i, countPoint)
            return point.x + ',' + point.y
        }).join(' ')
        /* eslint-enable no-undef */

        return document.querySelector('polygon').attributes[0].value === points
    }, {
        dependencies: { countPoint }
    })

    await t.expect(await checkPolygonPoints()).ok()
}

// NOTE: https://github.com/DevExpress/testcafe/issues/995
export function getInnerHtml (selector) {
    return ClientFunction(() => {
        var el = selector()

        return el && el.innerHTML
    }, {
        dependencies: { selector }
    })()
}
