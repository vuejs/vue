casper.test.begin('Validation', 4, function (test) {
    
    casper
    .start('./fixtures/validation.html', function () {
        test.assertElementCount('.valid', 0)
        this.sendKeys('input', '@hello.com')
    })
    .then(function () {
        test.assertElementCount('.valid', 1)
    })
    .thenEvaluate(function () {
        document.querySelector('input').setSelectionRange(4,4)
    })
    .then(function () {
        this.sendKeys('input', 'hoho')
    })
    .then(function () {
        test.assertElementCount('.valid', 1)
        test.assertField('email', 'hihihoho@hello.com')
    })
    .run(function () {
        test.done()
    })

})