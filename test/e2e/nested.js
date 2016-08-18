casper.test.begin('nested', 5, function (test) {
  casper
  .start('../../examples/nested/index.html')
  .then(function () {
    test.assertElementCount('span', 4)
    test.assertSelectorHasText('span.one', 'true')
    test.assertSelectorHasText('span.two', 'true')
    test.assertSelectorHasText('span.three', 'true')
    test.assertSelectorHasText('span.four', 'true')
  })
  // run
  .run(function () {
    test.done()
  })
})
