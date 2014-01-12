casper.test.begin('Components', 5, function (test) {
    
    casper
    .start('./fixtures/component.html')
    .then(function () {
        var expected = '123 Jack'
        test.assertSelectorHasText('#component-and-with', expected)
        test.assertSelectorHasText('#element-and-with', expected)
        test.assertSelectorHasText('#component', expected)
        test.assertSelectorHasText('#with', expected)
        test.assertSelectorHasText('#element', expected)
    })
    .run(function () {
        test.done()
    })

})