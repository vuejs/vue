casper.test.begin('Tree View', 11, function (test) {

    casper
    .start('./fixtures/tree.html')
    .then(function () {
        test.assertElementCount('.item', 12)
        test.assertElementCount('ul', 5)
        test.assertSelectorHasText('.item.folder', 'My Tree')
        test.assertSelectorHasText('li:nth-child(1) .item.file', 'hello')
        test.assertSelectorHasText('li:nth-child(2) .item.file', 'wat')
        test.assertVisible('#root')
        test.assertNotVisible('#root li > ul')
    })
    .thenClick('.item.folder', function () {
        test.assertVisible('#root li > ul')
        test.assertNotVisible('#root li > ul li > ul')
    })
    .thenClick('#root li > ul .item.folder', function () {
        test.assertVisible('#root li > ul li > ul')
    })
    .thenClick('.item.folder', function () {
        test.assertNotVisible('#root li > ul')
    })
    .run(function () {
        test.done()
    })

})