casper.test.begin('Events', 5, function (test) {
    
    // testing event delegation
    // mostly inline events
    // and e.stopPropagation(), e.preventDefault()

    casper
    .start('./fixtures/events.html')
    .thenClick('.normal', function () {
        test.assertNotVisible('.outer')
    })
    .thenClick('.exp', function () {
        test.assertNotVisible('.outer')
        test.assertSelectorHasText('.msg', 'hello')
        test.assertEval(function () {
            return !window.location.hash
        })
    })
    .thenClick('div', function () {
        test.assertVisible('.outer')
    })
    .run(function () {
        test.done()
    })

})