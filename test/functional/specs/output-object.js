casper.test.begin('Outputting Objects', 17, function (test) {
    
    casper
    .start('./fixtures/output-object.html')
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"prop":1},"arr":[{"a":1}]}')
        test.assertSelectorHasText('#obj', '{"prop":1}')
        test.assertSelectorHasText('#arr', '[{"a":1}]')
    })
    // setting a nested property
    .thenEvaluate(function () {
        test.test.prop = 2
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"prop":2},"arr":[{"a":1}]}')
        test.assertSelectorHasText('#obj', '{"prop":2}')
    })
    // setting a nested object
    .thenEvaluate(function () {
        test.test = { hi:3 }
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"hi":3},"arr":[{"a":1}]}')
        test.assertSelectorHasText('#obj', '{"hi":3}')
    })
    // mutating an array
    .thenEvaluate(function () {
        test.arr.push({a:2})
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"hi":3},"arr":[{"a":1},{"a":2}]}')
        test.assertSelectorHasText('#arr', '[{"a":1},{"a":2}]')
    })
    // no length change mutate an array
    .thenEvaluate(function () {
        test.arr.reverse()
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"hi":3},"arr":[{"a":2},{"a":1}]}')
        test.assertSelectorHasText('#arr', '[{"a":2},{"a":1}]')
    })
    // setting objects inside Array
    .thenEvaluate(function () {
        test.arr[0].a = 3
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"hi":3},"arr":[{"a":3},{"a":1}]}')
        test.assertSelectorHasText('#arr', '[{"a":3},{"a":1}]')
    })
    // swap the array
    .thenEvaluate(function () {
        test.arr = [1,2,3]
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"hi":3},"arr":[1,2,3]}')
        test.assertSelectorHasText('#arr', '[1,2,3]')
    })
    // setting $data
    .thenEvaluate(function () {
        test.$data = { test: { swapped: true }, arr:[3,2,1] }
    })
    .then(function () {
        test.assertSelectorHasText('#data', '{"test":{"swapped":true},"arr":[3,2,1]}')
        test.assertSelectorHasText('#obj', '{"swapped":true}')
    })
    .run(function () {
        test.done()
    })

})