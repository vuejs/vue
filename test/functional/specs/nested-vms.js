casper.test.begin('Nested Viewmodels', 7, function (test) {
    
    casper
    .start('./fixtures/nested-viewmodels.html', function () {

        test.assertSelectorHasText('.ancestor', 'Andy Johnson')
        test.assertSelectorHasText('.jack', 'Jack, son of Andy')
        test.assertSelectorHasText('.mike', 'Mike, son of Jack')
        test.assertSelectorHasText('.jason', 'Jason, son of Jack')

        test.assertSelectorHasText('.tim', 'Tim, son of Mike, grandson of Jack, great-grandson of Andy, and offspring of family Johnson.')
        test.assertSelectorHasText('.tom', 'Tom, son of Mike, grandson of Jack, great-grandson of Andy, and offspring of family Johnson.')
        test.assertSelectorHasText('.andrew', 'Andrew, son of Jason, grandson of Jack, great-grandson of Andy, and offspring of family Johnson.')

    })
    .run(function () {
        test.done()
    })

})