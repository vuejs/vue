casper.test.begin('select2', 20, function (test) {
  casper
  .start('examples/select2/index.html')
  .then(function () {
    test.assertSelectorHasText('p', 'Selected: 0')
    test.assertSelectorHasText('span.select2', 'Select one')
  })

  // test open and selecting
  .then(function () {
    // must use a positional click
    this.mouse.click('span.select2')
  })
  .then(function () {
    test.assertElementCount('.select2-results__option', 3)
    test.assertSelectorHasText('.select2-results__option:nth-child(1)', 'Select one')
    test.assertSelectorHasText('.select2-results__option:nth-child(2)', 'Hello')
    test.assertSelectorHasText('.select2-results__option:nth-child(3)', 'World')
    test.assertEval(function () {
      return document
        .querySelector('.select2-results__option:nth-child(1)')
        .hasAttribute('aria-disabled')
    })
  })
  .then(function () {
    this.mouse.click('.select2-results__option:nth-child(2)')
  })
  .then(function () {
    test.assertElementCount('.select2-results__option', 0)
    test.assertSelectorHasText('p', 'Selected: 1')
    test.assertSelectorHasText('span.select2', 'Hello')
  })

  // test dynamic options
  .thenEvaluate(function () {
    vm.options.push({ id: 3, text: 'Vue' })
  })
  .then(function () {
    this.mouse.click('span.select2')
  })
  .then(function () {
    test.assertElementCount('.select2-results__option', 4)
    test.assertSelectorHasText('.select2-results__option:nth-child(1)', 'Select one')
    test.assertSelectorHasText('.select2-results__option:nth-child(2)', 'Hello')
    test.assertSelectorHasText('.select2-results__option:nth-child(3)', 'World')
    test.assertSelectorHasText('.select2-results__option:nth-child(4)', 'Vue')
  })
  .then(function () {
    this.mouse.click('.select2-results__option:nth-child(4)')
  })
  .then(function () {
    test.assertElementCount('.select2-results__option', 0)
    test.assertSelectorHasText('p', 'Selected: 3')
    test.assertSelectorHasText('span.select2', 'Vue')
  })

  // test parent setting value down
  .thenEvaluate(function () {
    vm.selected = 2
  })
  .then(function () {
    test.assertSelectorHasText('p', 'Selected: 2')
    test.assertSelectorHasText('span.select2', 'World')
  })

  // run
  .run(function () {
    test.done()
  })
})
