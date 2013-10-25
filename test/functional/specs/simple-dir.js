casper.test.begin('Simple Directive', 3, function (test) {
    
    casper
    .start('./fixtures/simple-dir.html', function () {

        test.assertSelectorHasText('.one', 'bind', 'object definition bind')
        test.assertSelectorHasText('.two', 'bind', 'function definition bind')

        this.evaluate(function () {
            /* global a */
            a.$destroy()
        })

        test.assertSelectorHasText('.one', 'unbind', 'object definition unbind')

    })
    .run(function () {
        test.done()
    })

})