casper.test.begin('Components', 7, function (test) {
    
    casper
    .start('./fixtures/component.html')
    .then(function () {
        var expected = 'hello Vue'
        test.assertSelectorHasText('#component-and-with', expected)
        test.assertSelectorHasText('#element-and-with', expected)
        test.assertSelectorHasText('#component', expected)
        test.assertSelectorHasText('#with', expected)
        test.assertSelectorHasText('#element', expected)
        test.assertSelectorHasText('#with-sync', expected)
        test.assertSelectorHasText('#component-with-sync', expected)
    })
    .run(function () {
        test.done()
    })

})