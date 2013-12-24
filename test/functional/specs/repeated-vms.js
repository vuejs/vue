casper.test.begin('Repeated ViewModels', 7, function (test) {
    
    casper
    .start('./fixtures/repeated-vms.html')
    .then(function () {

        test.assertSelectorHasText('.item:nth-child(1)', 'msg a init')
        test.assertSelectorHasText('.item:nth-child(2)', 'msg b init')
        test.assertSelectorHasText('.item:nth-child(3)', 'msg c init')

    })
    // click everything to test event handlers (delegated)
    .thenClick('.item:nth-child(1)', function () {
        test.assertSelectorHasText('.item:nth-child(1)', 'msg a init click')
    })
    .thenClick('.item:nth-child(2)', function () {
        test.assertSelectorHasText('.item:nth-child(2)', 'msg b init click')
    })
    .thenClick('.item:nth-child(3)', function () {
        test.assertSelectorHasText('.item:nth-child(3)', 'msg c init click')
    })
    // more clicks
    .thenClick('.item:nth-child(1)', function () {
        test.assertSelectorHasText('.item:nth-child(1)', 'msg a init click click')
    })
    .run(function () {
        test.done()
    })

})