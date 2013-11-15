casper.test.begin('Routing', 10, function (test) {
    
    casper
    .start('./fixtures/routing.html', function () {
        test.assertElementCount('div', 1)
        test.assertSelectorHasText('div', 'Hi!')
    })
    .thenClick('a', function () {
        test.assertElementCount('div', 1)
        test.assertSelectorHasText('div', 'Ho!')
    })
    .thenClick('a', function () {
        test.assertElementCount('div', 1)
        test.assertSelectorHasText('div', 'Ha!')
    })
    .thenClick('a', function () {
        test.assertElementCount('div', 1)
        test.assertSelectorHasText('div', 'Hi!')
    })
    .thenOpen('./fixtures/routing.html#ho', function () {
        test.assertElementCount('div', 1)
        test.assertSelectorHasText('div', 'Ho!')
    })
    .run(function () {
        test.done()
    })

})