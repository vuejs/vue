casper.test.begin('Expression', 8, function (test) {
    
    casper
    .start('./fixtures/expression.html', function () {

        test.assertSelectorHasText('#normal p', 'Hello World!')
        test.assertSelectorHasText('#lazy p', 'Hi Ho!')
        test.assertField('one', 'Hello')
        test.assertField('two', 'World')
        test.assertField('three', 'Hi')
        test.assertField('four', 'Ho')

        // lazy
        this.fill('#form', {
            three: 'three',
            four: 'four'
        })
        test.assertSelectorHasText('#lazy p', 'three four!')

        // normal
        this.evaluate(function () {
            var one = document.getElementById('one')
            var e = document.createEvent('MouseEvent')
            e.initMouseEvent('keyup', true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
            one.value = 'Bye'
            one.dispatchEvent(e)
        })
        test.assertSelectorHasText('#normal p', 'Bye World!')
        
    })
    .run(function () {
        test.done()
    })

})