/* global numbers */

casper.test.begin('Repeated Primitives', 8, function (test) {
    
    casper
    .start('./fixtures/repeated-primitive.html')
    .then(function () {

        test.assertSelectorHasText('p:nth-child(1)', '1')
        test.assertSelectorHasText('p:nth-child(2)', '2')
        test.assertSelectorHasText('p:nth-child(3)', 'text')

    })
    // click everything to test event handlers (delegated)
    .thenClick('p:nth-child(1)', function () {
        test.assertSelectorHasText('p:nth-child(1)', '1 modified')
    })
    .thenClick('p:nth-child(2)', function () {
        test.assertSelectorHasText('p:nth-child(2)', '2 modified')
    })
    .thenClick('p:nth-child(3)', function () {
        test.assertSelectorHasText('p:nth-child(3)', 'text modified')
    })
    // more clicks
    .thenClick('p:nth-child(1)', function () {
        test.assertSelectorHasText('p:nth-child(1)', '1 modified modified')
    })
    .then(function () {
        test.assertEvalEquals(function () {
            return numbers
        }, ['1 modified modified', '2 modified', 'text modified'])
    })
    .run(function () {
        test.done()
    })

})