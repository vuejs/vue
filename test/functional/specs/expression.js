/* global normal, attrs, html */

casper.test.begin('Expression', 23, function (test) {
    
    casper
    .start('./fixtures/expression.html')
    .then(function () {
        test.assertSelectorHasText('#normal p', 'Hello World!')
        test.assertSelectorHasText('#lazy p', 'Hi Ho!')
        test.assertField('one', 'Hello')
        test.assertField('two', 'World')
        test.assertField('three', 'Hi')
        test.assertField('four', 'Ho')
        // attrs
        test.assertEval(function () {
            return document.getElementById('attrs').dataset.test === 'hi hoef ha'
        })
    })
    .thenEvaluate(function () {
        // setting value
        normal.one = 'Hola'
    })
    .then(function () {
        test.assertSelectorHasText('#normal p', 'Hola World!')
        test.assertField('one', 'Hola')
    })
    .thenEvaluate(function () {
        // setting nested value
        normal.two.three = 'Casper'
    })
    .then(function () {
        test.assertSelectorHasText('#normal p', 'Hola Casper!')
        test.assertField('two', 'Casper')
    })
    .then(function () {
        // lazy input
        this.fill('#form', {
            three: 'three',
            four: 'four'
        })
    })
    .then(function () {
        test.assertSelectorHasText('#lazy p', 'three four!')
    })
    .then(function () {
        // normal input
        this.sendKeys('#one', 'Bye')
    })
    .then(function () {
        test.assertSelectorHasText('#normal p', 'Bye Casper!')
    })
    // v-on with expression
    .thenClick('#normal button', function () {
        test.assertField('one', 'clicked')
        test.assertSelectorHasText('#normal p', 'clicked Casper!')
    })
    // v-on with expression
    .thenClick('#lazy button', function () {
        test.assertField('four', 'clicked')
        test.assertSelectorHasText('#lazy p', 'three clicked!')
    })
    // conditional expression
    // e.g. ok ? yesMSg : noMsg
    // make sure all three are captured as dependency
    .then(function () {
        test.assertSelectorHasText('#conditional p', 'YES')
    })
    .thenClick('#conditional .toggle', function () {
        test.assertSelectorHasText('#conditional p', 'NO')
    })
    .thenClick('#conditional .change', function () {
        test.assertSelectorHasText('#conditional p', 'Nah')
    })
    .thenEvaluate(function () {
        attrs.msg = 'hoho'
    })
    .then(function () {
        // attr
        test.assertEvalEquals(function () {
            return document.getElementById('attrs').dataset.test
        }, 'hi hohoef ha')
        // html
        test.assertEvalEquals(function () {
            return document.getElementById('html').innerHTML
        }, 'html <p>should</p> <a>probably</a><!--v-html--> work')
    })
    .thenEvaluate(function () {
        html.html = '<span>should</span> <a>change work</a>'
    })
    .then(function () {
        test.assertEvalEquals(function () {
            return document.getElementById('html').innerHTML
        }, 'html <span>should</span> <a>change work</a><!--v-html--> work')
    })
    .run(function () {
        test.done()
    })

})