casper.on('remote.message', function (e) {
  console.log(e)
})

casper.test.begin('commits', 26, function (test) {

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
    test.assertSelectorHasText('li:first-child a.commit', '1111111')
    test.assertSelectorHasText('li:first-child span.message', 'one')
    test.assertSelectorHasText('li:first-child span.author', 'Evan')
    test.assertSelectorHasText('li:first-child span.date', '2014-10-15 13:52:58')
  })
  .thenClick('input[value="dev"]', function () {
    test.assertField('branch', 'dev')
    test.assertSelectorHasText('p', 'yyx990803/vue@dev')
    test.assertElementCount('li', 3)
    test.assertSelectorHasText('li:first-child a.commit', '2222222')
    test.assertSelectorHasText('li:first-child span.message', 'two')
    test.assertSelectorHasText('li:first-child span.author', 'Evan')
    test.assertSelectorHasText('li:first-child span.date', '2014-10-15 13:52:58')
  })
  .thenClick('input[value="next"]', function () {
    test.assertField('branch', 'next')
    test.assertSelectorHasText('p', 'yyx990803/vue@next')
    test.assertElementCount('li', 3)
    test.assertSelectorHasText('li:first-child a.commit', '3333333')
    test.assertSelectorHasText('li:first-child span.message', 'three')
    test.assertSelectorHasText('li:first-child span.author', 'Evan')
    test.assertSelectorHasText('li:first-child span.date', '2014-10-15 13:52:58')
  })
  // run
  .run(function () {
    test.done()
  })

})
