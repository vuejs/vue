casper.test.begin('Validation', 9, function (test) {
    
    casper
    .start('./fixtures/validation.html')
    .then(function () {
        test.assertElementCount('.valid', 0)
        this.sendKeys('input[name="name"]', 'haha')
    })
    .then(function () {
        test.assertElementCount('.valid', 1)
        this.sendKeys('input[name="email"]', 'hello')
    })
    .then(function () {
        // email should be invalid
        test.assertElementCount('.valid', 1)
        this.sendKeys('input[name="email"]', 'heo@bar.com', { reset: true })
    })
    .then(function () {
        // email should be valid now
        test.assertField('email', 'heo@bar.com')
        test.assertElementCount('.valid', 2)
    })
    // test edit/insertion when there are filters
    .thenEvaluate(function () {
        document.querySelector('input[name="email"]').setSelectionRange(2,2)
    })
    .then(function () {
        this.sendKeys('input[name="email"]', 'll')
    })
    .then(function () {
        test.assertElementCount('.valid', 2)
        test.assertField('email', 'hello@bar.com')
    })
    .thenClick('#go')
    .then(function () {
        test.assertElementCount('.user', 1)
        test.assertSelectorHasText('.user', 'haha hello@bar.com')
    })
    .run(function () {
        test.done()
    })

})