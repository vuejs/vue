casper.test.begin('modal', 8, function (test) {
  casper
  .start('examples/modal/index.html')
  .then(function () {
    test.assertNotVisible('.modal-mask')
  })
  .thenClick('#show-modal', function () {
    test.assertVisible('.modal-mask')
    test.assertVisible('.modal-wrapper')
    test.assertVisible('.modal-container')
    test.assertSelectorHasText('.modal-header h3', 'custom header')
    test.assertSelectorHasText('.modal-body', 'default body')
    test.assertSelectorHasText('.modal-footer', 'default footer')
  })
  .thenClick('.modal-default-button', function () {
    test.assertNotVisible('.modal-mask')
  })
  // run
  .run(function () {
    test.done()
  })
})
