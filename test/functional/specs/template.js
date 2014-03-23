casper.test.begin('Templates and Partials', 7, function (test) {
    
    casper
    .start('./fixtures/template.html')
    .then(function () {
        test.assertSelectorHasText('#usa', 'Hi dude', 'global partial')
        test.assertSelectorHasText('#japan', 'こんにちは', 'local partial')
        test.assertSelectorHasText('#china', '你好', 'direct option')
        test.assertSelectorHasText('#hawaii', 'Aloha', 'extend option')
        test.assertSelectorHasText('#repeat', 'Repeat', 'inline partial with repeat')
        test.assertEvalEquals(function () {
            return document.querySelector('#content').textContent
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
        }, ' before A B rest rest after ')
        test.assertSelectorHasText('#fallback', 'This is fallback')
    })
    .run(function () {
        test.done()
    })

})