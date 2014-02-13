casper.test.begin('Outputting Objects', 8, function (test) {
    
    casper
    .start('./fixtures/output-object.html')
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"prop":1}}')
        test.assertSelectorHasText('#obj', '{"prop":1}')
    })
    // setting a nested property
    .thenEvaluate(function () {
        test.test.prop = 2
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"prop":2}}')
        test.assertSelectorHasText('#obj', '{"prop":2}')
    })
    // setting a nested object
    .thenEvaluate(function () {
        test.test = { hi:3 }
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"hi":3}}')
        test.assertSelectorHasText('#obj', '{"hi":3}')
    })
    // setting $data
    .thenEvaluate(function () {
        test.$data = { test: { swapped: true } }
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"swapped":true}}')
        test.assertSelectorHasText('#obj', '{"swapped":true}')
    })
    .run(function () {
        test.done()
    })

})