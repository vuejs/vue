casper.test.begin('Encapsulation & Inheritance', 8, function (test) {
    
    casper
    .start('./fixtures/extend.html')
    .then(function () {
        test.assertSelectorHasText('.dir', 'directive works')
        test.assertSelectorHasText('.filter', 'filter works')
        test.assertSelectorHasText('.partial', 'partial works')
        test.assertSelectorHasText('.vm', 'component works')
        test.assertSelectorHasText('.vm-w-model', 'component + with works')
        test.assertSelectorHasText('#log', 'T created T ready T created C created T ready C ready', 'hook inheritance works')
        test.assertSelectorHasText('.cvm', 'component works', 'Child should have access to Parent options')
    })
    .thenEvaluate(function () {
        test.vmData = {
            selfMsg: 'replacing $data ',
            msg: 'also works'
        }
    })
    .then(function () {
        test.assertSelectorHasText('.vm-w-model', 'replacing $data also works')
    })
    .run(function () {
        test.done()
    })

})