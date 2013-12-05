casper.test.begin('Custom Elements', 3, function (test) {
    
    casper
    .start('./fixtures/custom-element.html', function () {
        test.assertSelectorHasText('div.test', 'hihi')
        test.assertSelectorHasText('cool.cool', 'This is cool')
        test.assertSelectorHasText('wow', 'this is wow')
    })
    .run(function () {
        test.done()
    })

})