/*global vm:true*/
import { Select2Page } from '../page-models'

fixture `Select2`
    .page('http://localhost:8080/examples/select2/')

const page = new Select2Page()
const { select2, selected } = page

test('select2', async t => {
    await t
        .expect(select2.fallbackSelect.exists).ok()
        .expect(selected.textContent).contains('Selected: 0')
        .expect(select2.container.textContent).contains('Select one')

        .click(select2.dropdown)
        .expect(select2.options.count).eql(3)
        .expect(select2.options.nth(0).textContent).eql('Select one')
        .expect(select2.options.nth(1).textContent).eql('Hello')
        .expect(select2.options.nth(0).getAttribute('aria-disabled')).eql('true')

        .click(select2.options.nth(1))
        .expect(selected.textContent).eql('Selected: 1')
        .expect(select2.container.textContent).eql('Hello')

    // test dynamic options
    await t.eval(() => vm.options.push({ id: 3, text: 'Vue' }))
    await t
        .click(select2.dropdown)
        .expect(select2.options.count).eql(4)
        .expect(select2.options.nth(0).textContent).eql('Select one')
        .expect(select2.options.nth(1).textContent).eql('Hello')
        .expect(select2.options.nth(2).textContent).eql('World')
        .expect(select2.options.nth(3).textContent).eql('Vue')

        .click(select2.options.nth(3))
        .expect(select2.options.count).eql(0)
        .expect(selected.textContent).eql('Selected: 3')

    /* eslint-disable no-return-assign */
    await t.eval(() => vm.selected = 2)
    /* eslint-enable no-return-assign */
    await t
        .expect(selected.textContent).eql('Selected: 2')
        .expect(select2.container.textContent).eql('World')
})

