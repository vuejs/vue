casper.test.begin('Repeated Items', 41, function (test) {
    
    casper
    .start('./fixtures/repeated-items.html', function () {

        // initial values
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 A')
        test.assertSelectorHasText('.item:nth-child(2)', '1 B')
        test.assertSelectorHasText('.item:nth-child(3)', '2 C')

        this.click('.push')
        test.assertSelectorHasText('.count', '4')
        test.assertSelectorHasText('.item:nth-child(4)', '3 0')

        this.click('.shift')
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 B')
        test.assertSelectorHasText('.item:nth-child(2)', '1 C')
        test.assertSelectorHasText('.item:nth-child(3)', '2 0')

        this.click('.pop')
        test.assertSelectorHasText('.count', '2')
        test.assertSelectorHasText('.item:nth-child(1)', '0 B')
        test.assertSelectorHasText('.item:nth-child(2)', '1 C')

        this.click('.unshift')
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 B')
        test.assertSelectorHasText('.item:nth-child(3)', '2 C')

        this.click('.splice')
        test.assertSelectorHasText('.count', '4')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 3')
        test.assertSelectorHasText('.item:nth-child(4)', '3 C')

        this.click('.remove')
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 3')

        this.click('.replace')
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 4')

        this.click('.reverse')
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 4')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 1')

        this.click('.sort')
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 4')

        // make sure things work on empty array
        this.click('.pop')
        this.click('.pop')
        this.click('.pop')
        this.click('.pop')
        this.click('.shift')
        this.click('.remove')
        this.click('.replace')
        this.click('.sort')
        this.click('.reverse')
        this.click('.splice')
        test.assertSelectorHasText('.count', '2')
        test.assertSelectorHasText('.item:nth-child(1)', '0 6')
        test.assertSelectorHasText('.item:nth-child(2)', '1 7')

    })
    .run(function () {
        test.done()
    })

})