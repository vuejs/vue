casper.test.begin('Nested Repeat', 12, function (test) {
    
    casper
    .start('./fixtures/nested-repeat.html', function () {

        var i, j

        for (i = 0; i < 2; i++) {
            for (j = 0; j < 2; j++) {
                test.assertSelectorHasText(
                    '.list-' + i + ' .list-' + j,
                    i + '.' + j + ' : ' + i + '<-' + j
                )
            }
        }

        this.click('#b0')
        this.click('#b1')

        for (i = 0; i < 2; i++) {
            for (j = 0; j < 2; j++) {
                test.assertSelectorHasText(
                    '.list-' + i + ' .list-' + j,
                    i + '.' + j + ' : hi<-' + j
                )
            }
        }

        for (i = 0; i < 2; i++) {
            for (j = 0; j < 2; j++) {
                this.click('#b' + i + '-' + j)
                test.assertSelectorHasText(
                    '.list-' + i + ' .list-' + j,
                    i + '.' + j + ' : hi<-hi'
                )
            }
        }

    })
    .run(function () {
        test.done()
    })

})