casper.test.begin('Computed property depending on repeated items', 4, function (test) {
    
    casper
    .start('./fixtures/computed-repeat.html')
    .then(function () {
        test.assertSelectorHasText('#texts', 'a,b')
    })
    .thenClick('#add', function () {
        test.assertSelectorHasText('#texts', 'a,b,c')
    })
    .then(function () {
        this.fill('#form', {
            "text0": 'd',
            "text1": 'e',
            "text2": 'f',
        })
    })
    .then(function () {
        this.sendKeys('input[name="text2"]', 'fff')
    })
    .then(function () {
        test.assertField('text0', 'd')
        test.assertSelectorHasText('#texts', 'd,e,ffff')
    })
    .run(function () {
        test.done()
    })

})