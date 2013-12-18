casper.test.begin('Component Encapsulation', 5, function (test) {
    
    casper
    .start('./fixtures/encapsulation.html', function () {
        test.assertSelectorHasText('.dir', 'directive works')
        test.assertSelectorHasText('.filter', 'filter works')
        test.assertSelectorHasText('.partial', 'partial works')
        test.assertSelectorHasText('.vm', 'component works')
        test.assertSelectorHasText('.vm-w-model', 'component with model works')
    })
    .run(function () {
        test.done()
    })

})