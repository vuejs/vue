casper.test.begin('Simple Directive', 3, function (test) {
    
    casper
    .start('./fixtures/simple-dir.html')
    .then(function () {
        test.assertSelectorHasText('.one', 'bind', 'object definition bind')
        test.assertSelectorHasText('.two', 'bind', 'function definition bind')
    })
    .thenEvaluate(function () {
        /* global a */
        a.$destroy()
    })
    .then(function () {
        test.assertSelectorHasText('.one', 'unbind', 'object definition unbind')
    })
    .run(function () {
        test.done()
    })

})