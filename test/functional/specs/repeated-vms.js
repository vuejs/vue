casper.test.begin('Repeated ViewModels', 7, function (test) {
    
    casper
    .start('./fixtures/repeated-vms.html', function () {

        test.assertSelectorHasText('.item:nth-child(1)', 'msg a init')
        test.assertSelectorHasText('.item:nth-child(2)', 'msg b init')
        test.assertSelectorHasText('.item:nth-child(3)', 'msg c init')

        // click everything to test event handlers (delegated)
        this.click('.item:nth-child(1)')
        test.assertSelectorHasText('.item:nth-child(1)', 'msg a init click')
        this.click('.item:nth-child(2)')
        test.assertSelectorHasText('.item:nth-child(2)', 'msg b init click')
        this.click('.item:nth-child(3)')
        test.assertSelectorHasText('.item:nth-child(3)', 'msg c init click')

        // more clicks
        this.click('.item:nth-child(1)')
        test.assertSelectorHasText('.item:nth-child(1)', 'msg a init click click')

    })
    .run(function () {
        test.done()
    })

})