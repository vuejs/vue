casper.test.begin('Templates and Partials', 5, function (test) {
    
    casper
    .start('./fixtures/template.html')
    .then(function () {
        test.assertSelectorHasText('#usa', 'Hi dude', 'global partial')
        test.assertSelectorHasText('#japan', 'こんにちは', 'local partial')
        test.assertSelectorHasText('#china', '你好', 'direct option')
        test.assertSelectorHasText('#hawaii', 'Aloha', 'extend option')
        test.assertSelectorHasText('#repeat', 'Repeat', 'inline partial with repeat')
    })
    .run(function () {
        test.done()
    })

})