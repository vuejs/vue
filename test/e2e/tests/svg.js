import { SvgPage } from '../page-models'
import { assertPoligonPoints } from '../testing-helpers'

fixture `Svg`
    .page('http://localhost:8080/examples/svg/')

const page = new SvgPage()
const { svg, labels, buttons, ranges, addForm } = page

test('svg', async t => {
    await t
        .expect(svg.find('g').count).eql(1)
        .expect(svg.find('polygon').count).eql(1)
        .expect(svg.find('circle').count).eql(1)
        .expect(svg.find('text').count).eql(6)
        .expect(labels.count).eql(6)
        .expect(buttons.count).eql(7)
        .expect(ranges.count).eql(6)
    await assertPoligonPoints(t, 6)

    await t
        .click(buttons.nth(0))
        .expect(svg.find('text').count).eql(5)
        .expect(labels.count).eql(5)
        .expect(ranges.count).eql(5)
    await assertPoligonPoints(t, 5)

    await t
        .typeText(addForm.input, 'foo')
        .click(addForm.button)
        .expect(svg.find('text').count).eql(6)
        .expect(labels.count).eql(6)
        .expect(buttons.count).eql(7)
        .expect(ranges.count).eql(6)
    await assertPoligonPoints(t, 6)
})
