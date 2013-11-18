casper.test.begin('Nested Properties', 20, function (test) {
    
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

        // hidden scope variables
        // i.e. nested under an object, not explicitly
        // bound in the template, but is depended upon
        // by an expression or a computed property
        test.assertSelectorHasText('.hidden', '3')
        this.click('.four')
        test.assertSelectorHasText('.hidden', '4')

        // set a nested object to {}
        this.click('.empty1')
        test.assertSelectorHasText('h1 span', '')
        test.assertSelectorHasText('h3 span', 'Oh yeah 3')

        this.click('.empty2')
        test.assertSelectorHasText('h1 span', '')
        test.assertSelectorHasText('h2 span', '')
        test.assertSelectorHasText('h3 span', 'Oh yeah ')

    })
    .run(function () {
        test.done()
    })

})