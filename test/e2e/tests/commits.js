import { CommitsPage } from '../page-models'

fixture `Commits`
    .page('http://localhost:8080/examples/commits/')

const page = new CommitsPage()
const { branch, commits } = page

test('commits', async t => {
    await t
        .expect(branch.inputs.count).eql(2)
        .expect(branch.labels.count).eql(2)
        .expect(branch.labelForMaster.textContent).contains('master')
        .expect(branch.labelForDev.textContent).contains('dev')
        .expect(branch.master.checked).ok()
        .expect(branch.dev.checked).notOk()
        .expect(branch.current.textContent).contains('vuejs/vue@master')
        .expect(commits.allItems.count).eql(3)
        .expect(commits.ids.count).eql(3)
        .expect(commits.messages.count).eql(3)

        .click(branch.dev)
        .expect(branch.current.textContent).contains('vuejs/vue@dev')
        .expect(commits.allItems.count).eql(3)
        .expect(commits.ids.count).eql(3)
        .expect(commits.messages.count).eql(3)
})
