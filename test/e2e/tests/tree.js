import { TreePage } from '../page-models'

fixture `Tree`
    .page('http://localhost:8080/examples/tree/')

const page = new TreePage()
const { allItems, allAddItems, allChildFolders, topLevelRoot } = page

test('tree', async t => {
    await t
        .expect(allItems.count).eql(12)
        .expect(allAddItems.count).eql(4)
        .expect(allChildFolders.count).eql(4)
        .expect(topLevelRoot.childNodesContainer.visible).notOk()
        .expect(topLevelRoot.name.textContent).contains('[+]')

        // expand root
        .click(topLevelRoot.name)
        .expect(topLevelRoot.childNodesContainer.visible).ok()
        .expect(topLevelRoot.childNodesContainer.child().count).eql(4)
        .expect(topLevelRoot.name.textContent).contains('[-]')
        .expect(topLevelRoot.childNodesContainer.child(0).textContent).contains('hello')
        .expect(topLevelRoot.childNodesContainer.child(1).textContent).contains('wat')
        .expect(topLevelRoot.childNodesContainer.child(2).textContent).contains('child folder')
        .expect(topLevelRoot.childNodesContainer.child(3).textContent).contains('+')

        // add items to root
        .click(topLevelRoot.addNew)
        .expect(topLevelRoot.childNodesContainer.child().count).eql(5)
        .expect(topLevelRoot.childNodesContainer.child(0).textContent).contains('hello')
        .expect(topLevelRoot.childNodesContainer.child(1).textContent).contains('wat')
        .expect(topLevelRoot.childNodesContainer.child(2).textContent).contains('child folder')
        .expect(topLevelRoot.childNodesContainer.child(3).textContent).contains('new stuff')
        .expect(topLevelRoot.childNodesContainer.child(4).textContent).contains('+')

        // add another item
        .click(topLevelRoot.addNew)
        .expect(topLevelRoot.childNodesContainer.child().count).eql(6)
        .expect(topLevelRoot.childNodesContainer.child(0).textContent).contains('hello')
        .expect(topLevelRoot.childNodesContainer.child(1).textContent).contains('wat')
        .expect(topLevelRoot.childNodesContainer.child(2).textContent).contains('child folder')
        .expect(topLevelRoot.childNodesContainer.child(3).textContent).contains('new stuff')
        .expect(topLevelRoot.childNodesContainer.child(4).textContent).contains('new stuff')
        .expect(topLevelRoot.childNodesContainer.child(5).textContent).contains('+')

        .click(topLevelRoot.childNodesContainer.child(2))

    const secondLevelRoot = page.createModelFromDomNode(topLevelRoot.childNodesContainer.child(2))

    await t
        .expect(secondLevelRoot.childNodesContainer.visible).ok()
        .expect(secondLevelRoot.name.textContent).contains('[-]')
        .expect(secondLevelRoot.childNodesContainer.child().count).eql(5)

        .click(topLevelRoot.name)
        .expect(topLevelRoot.childNodesContainer.visible).notOk()
        .expect(topLevelRoot.name.textContent).contains('[+]')

        .click(topLevelRoot.name)
        .expect(topLevelRoot.childNodesContainer.visible).ok()
        .expect(topLevelRoot.name.textContent).contains('[-]')

        .doubleClick(topLevelRoot.childNodesContainer.child(0))
        .expect(allItems.count).eql(15)
        .expect(allChildFolders.count).eql(5)

    const helloTreeItem = page.createModelFromDomNode(page.topLevelRoot.childNodesContainer.child(0))

    await t
        .expect(helloTreeItem.name.textContent).contains('[-]')
        .expect(helloTreeItem.childNodesContainer.child().count).eql(2)
})
