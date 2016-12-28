import { ModalPage } from '../page-models'

fixture `Modal`
    .page('http://localhost:8080/examples/modal/')

const page = new ModalPage()
const { showModalBtn, modal } = page

test('modal', async t => {
    await t
        .click(showModalBtn)
        .expect(modal.mainElement.exists).ok()
        .expect(modal.wrapper.exists).ok()
        .expect(modal.container.exists).ok()
        .expect(modal.mainElement.hasClass('modal-enter-active')).ok()
        .expect(modal.mainElement.hasClass('modal-enter-active')).notOk()
        .expect(modal.header.find('h3').innerText).contains('custom header')
        .expect(modal.body.innerText).contains('default body')
        .expect(modal.footer.innerText).contains('default footer')

        .click(modal.defaultButton)
        .expect(modal.mainElement.exists).ok()
        .expect(modal.mainElement.hasClass('modal-leave-active')).ok()
        .expect(modal.mainElement.exists).notOk()
})
