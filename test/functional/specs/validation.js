casper.test.begin('Validation', 2, function (test) {
    
    casper
    .start('./fixtures/validation.html', function () {
        test.assertElementCount('.valid', 0)
        this.sendKeys('input', '@hello.com')
        test.assertElementCount('.valid', 1)
    })
    .run(function () {
        test.done()
    })

})