casper.test.begin('Nested Properties', 13, function (test) {
    
    casper
    .start('./fixtures/nested-props.html', function () {

        test.assertSelectorHasText('h1 span', '')
        test.assertSelectorHasText('h2 span', '555')
        test.assertSelectorHasText('h3 span', 'Yoyoyo555')

        this.click('.one')
        test.assertSelectorHasText('h1 span', 'one')
        test.assertSelectorHasText('h2 span', '1')
        test.assertSelectorHasText('h3 span', 'Yoyoyoone1')

        this.click('.two')
        test.assertSelectorHasText('h1 span', 'two')
        test.assertSelectorHasText('h2 span', '2')
        test.assertSelectorHasText('h3 span', 'Yoyoyotwo2')

        this.click('.three')
        test.assertSelectorHasText('h1 span', 'three')
        test.assertSelectorHasText('h2 span', '3')
        test.assertSelectorHasText('h3 span', 'Yoyoyothree3')

        this.fill('#form', {
            msg: 'Oh yeah '
        })
        test.assertSelectorHasText('h3 span', 'Oh yeah three3')

    })
    .run(function () {
        test.done()
    })

})