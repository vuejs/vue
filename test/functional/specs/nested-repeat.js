casper.test.begin('Nested Repeat', 12, function (test) {
    
    casper
    .start('./fixtures/nested-repeat.html')
    .then(function () {
        var i, j
        for (i = 0; i < 2; i++) {
            for (j = 0; j < 2; j++) {
                test.assertSelectorHasText(
                    '.list-' + i + ' .list-' + j,
                    i + '.' + j + ' : ' + i + '<-' + j
                )
            }
        }
    })
    .then(function () {
        this.click('#b0')
        this.click('#b1')
    })
    .then(function () {
        var i, j
        for (i = 0; i < 2; i++) {
            for (j = 0; j < 2; j++) {
                test.assertSelectorHasText(
                    '.list-' + i + ' .list-' + j,
                    i + '.' + j + ' : hi<-' + j
                )
            }
        }
    })
    .then(function () {
        var i, j
        for (i = 0; i < 2; i++) {
            for (j = 0; j < 2; j++) {
                this.click('#b' + i + '-' + j)
            }
        }
    })
    .then(function () {
        var i, j
        for (i = 0; i < 2; i++) {
            for (j = 0; j < 2; j++) {
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