casper.on('page.error', function (e) {
    console.log('\n\n' + e + '\n\n')
})

casper.test.begin('todomvc', 1, function (test) {
    
    casper
    .start('../../examples/todomvc/index.html', function () {
        test.assertNotVisible('#footer')
    })
    .run(function () {
        test.done()
    })

})