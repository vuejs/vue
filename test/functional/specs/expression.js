/* global normal */

casper.test.begin('Expression', 16, function (test) {
    
    casper
    .start('./fixtures/expression.html', function () {

        test.assertSelectorHasText('#normal p', 'Hello World!')
        test.assertSelectorHasText('#lazy p', 'Hi Ho!')
        test.assertField('one', 'Hello')
        test.assertField('two', 'World')
        test.assertField('three', 'Hi')
        test.assertField('four', 'Ho')

        // setting value
        this.evaluate(function () {
            normal.one = 'Hola'
        })
        test.assertSelectorHasText('#normal p', 'Hola World!')
        test.assertField('one', 'Hola')

        // setting nested value
        this.evaluate(function () {
            normal.two.three = 'Casper'
        })
        test.assertSelectorHasText('#normal p', 'Hola Casper!')
        test.assertField('two', 'Casper')

        // lazy input
        this.fill('#form', {
            three: 'three',
            four: 'four'
        })
        test.assertSelectorHasText('#lazy p', 'three four!')

        // normal input
        this.sendKeys('#one', 'Bye')
        test.assertSelectorHasText('#normal p', 'Bye Casper!')

        // sd-on with expression
        this.click('#normal button')
        test.assertField('one', 'clicked')
        test.assertSelectorHasText('#normal p', 'clicked Casper!')

        // sd-on with expression
        this.click('#lazy button')
        test.assertField('four', 'clicked')
        test.assertSelectorHasText('#lazy p', 'three clicked!')

    })
    .run(function () {
        test.done()
    })

})