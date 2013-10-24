casper.test.begin('Template', 4, function (test) {
    
    casper
    .start('./fixtures/template.html', function () {
        test.assertSelectorHasText('#usa', 'Hi dude', 'global partial')
        test.assertSelectorHasText('#japan', 'こんにちは', 'local partial')
        test.assertSelectorHasText('#china', '你好', 'direct option')
        test.assertSelectorHasText('#hawaii', 'Aloha', 'extend option')
    })

    .run(function () {
        test.done()
    })

})