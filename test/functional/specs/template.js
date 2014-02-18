casper.test.begin('Templates and Partials', 6, function (test) {
    
    casper
    .start('./fixtures/template.html')
    .then(function () {
        test.assertSelectorHasText('#usa', 'Hi dude', 'global partial')
        test.assertSelectorHasText('#japan', 'こんにちは', 'local partial')
        test.assertSelectorHasText('#china', '你好', 'direct option')
        test.assertSelectorHasText('#hawaii', 'Aloha', 'extend option')
        test.assertSelectorHasText('#repeat', 'Repeat', 'inline partial with repeat')
        test.assertEvalEquals(function () {
            return document.querySelector('#yielder').innerHTML
        }, '<yielder><h1>before</h1><p>A</p><p>B</p><h2>after</h2></yielder>')
    })
    .run(function () {
        test.done()
    })

})