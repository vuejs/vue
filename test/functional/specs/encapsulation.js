casper.test.begin('Component Encapsulation', 4, function (test) {
    
    casper
    .start('./fixtures/encapsulation.html', function () {
        test.assertSelectorHasText('.dir', 'directive works')
        test.assertSelectorHasText('.filter', 'filter works')
        test.assertSelectorHasText('.partial', 'partial works')
        test.assertSelectorHasText('.vm', 'component works')
    })
    .run(function () {
        test.done()
    })

})