casper.test.begin('testing it out', 5, function (test) {
    
    casper
    .start('./fixtures/simple.html', function () {
        test.assertSelectorHasText('span', 'YOYOYO', 'filter should work')
        test.assertNotVisible('h1', 'h1 should not be visible')
        test.assertDoesntExist('span.red', 'span should not be .red')
    })

    .thenClick('input[type="checkbox"]', function () {
        test.assertVisible('h1', 'h1 should be visible after clicking checkbox')
        test.assertExists('span.red', 'span should have .red after clicking checkbox')
    })

    .run(function () {
        test.done()
    })

})