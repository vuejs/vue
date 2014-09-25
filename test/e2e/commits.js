casper.test.begin('commits', 14, function (test) {
  
  casper
  .start('../../examples/commits/index.html')
  .then(function () {
    // radio inputs & labels
    test.assertElementCount('input', 3)
    test.assertElementCount('label', 3)
    test.assertSelectorHasText('label[for="master"]', 'master')
    test.assertSelectorHasText('label[for="dev"]', 'dev')
    test.assertSelectorHasText('label[for="next"]', 'next')
    // initial fetched commits
    test.assertField('branch', 'master')
    test.assertSelectorHasText('p', 'yyx990803/vue@master')
    test.assertElementCount('li', 3)
  })
  .thenClick('input[value="dev"]', function () {
    test.assertField('branch', 'dev')
    test.assertSelectorHasText('p', 'yyx990803/vue@dev')
    test.assertElementCount('li', 3)
  })
  .thenClick('input[value="next"]', function () {
    test.assertField('branch', 'next')
    test.assertSelectorHasText('p', 'yyx990803/vue@next')
    test.assertElementCount('li', 3)
  })
  // run
  .run(function () {
    test.done()
  })

})