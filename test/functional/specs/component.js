casper.test.begin('Components', 11, function (test) {
    
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
        test.assertSelectorHasText('#conditional', expected)
        test.assertElementCount('.repeat-conditional', 2)
        test.assertSelectorHasText('.repeat-conditional.my-element', expected)
        test.assertSelectorHasText('.repeat-conditional.nope', 'NOPE')
    })
    .run(function () {
        test.done()
    })

})