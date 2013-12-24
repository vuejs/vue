casper.test.begin('Nested Properties', 20, function (test) {
    
    casper
    .start('./fixtures/nested-props.html')
    .then(function () {
        test.assertSelectorHasText('h1 span', '')
        test.assertSelectorHasText('h2 span', '555')
        test.assertSelectorHasText('h3 span', 'Yoyoyo555')
    })
    .thenClick('.one', function () {
        test.assertSelectorHasText('h1 span', 'one')
        test.assertSelectorHasText('h2 span', '1')
        test.assertSelectorHasText('h3 span', 'Yoyoyoone1')
    })
    .thenClick('.two', function () {
        test.assertSelectorHasText('h1 span', 'two')
        test.assertSelectorHasText('h2 span', '2')
        test.assertSelectorHasText('h3 span', 'Yoyoyotwo2')
    })
    .thenClick('.three', function () {
        test.assertSelectorHasText('h1 span', 'three')
        test.assertSelectorHasText('h2 span', '3')
        test.assertSelectorHasText('h3 span', 'Yoyoyothree3')
    })
    .then(function () {
        this.fill('#form', {
            msg: 'Oh yeah '
        })
    })
    .then(function () {
        test.assertSelectorHasText('h3 span', 'Oh yeah three3')
    })
    // hidden data variables
    // i.e. nested under an object, not explicitly
    // bound in the template, but is depended upon
    // by an expression or a computed property
    .then(function () {
        test.assertSelectorHasText('.hidden', '3')
    })
    .thenClick('.four', function () {
        test.assertSelectorHasText('.hidden', '4')
    })
    // set a nested object to {}
    .thenClick('.empty1', function () {
        test.assertSelectorHasText('h1 span', '')
        test.assertSelectorHasText('h3 span', 'Oh yeah 3')
    })
    .thenClick('.empty2', function () {
        test.assertSelectorHasText('h1 span', '')
        test.assertSelectorHasText('h2 span', '')
        test.assertSelectorHasText('h3 span', 'Oh yeah ')
    })
    .run(function () {
        test.done()
    })

})