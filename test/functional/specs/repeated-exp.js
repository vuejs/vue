casper.test.begin('Repeated Expressions', 3, function (test) {
    
    casper
    .start('./fixtures/repeated-exp.html')
    .then(function () {
        this.click('.item-0')
        this.click('.item-1')
        this.click('.item-2')
    })
    .then(function () {
        test.assertSelectorHasText('.item-0', '2')
        test.assertSelectorHasText('.item-1', '3')
        test.assertSelectorHasText('.item-2', '4')
    })
    .run(function () {
        test.done()
    })

})