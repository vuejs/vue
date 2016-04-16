casper.test.begin('tree', 22, function (test) {
  casper
  .start('examples/tree/index.html')
  .then(function () {
    test.assertElementCount('.item', 12)
    test.assertElementCount('.item > ul', 4)
    test.assertNotVisible('#demo li ul')
    test.assertSelectorHasText('#demo li div span', '[+]')
  })
  .thenClick('.bold', function () {
    test.assertVisible('#demo ul')
    test.assertSelectorHasText('#demo li div span', '[-]')
    test.assertSelectorHasText('#demo ul > .item:nth-child(1)', 'hello')
    test.assertSelectorHasText('#demo ul > .item:nth-child(2)', 'wat')
    test.assertSelectorHasText('#demo ul > .item:nth-child(3)', 'child folder')
    test.assertSelectorHasText('#demo ul > .item:nth-child(3)', '[+]')
    test.assertEval(function () {
      return document.querySelector('#demo li ul').children.length === 4
    })
  })
  .thenClick('#demo ul .bold', function () {
    test.assertVisible('#demo ul ul')
    test.assertSelectorHasText('#demo ul > .item:nth-child(3)', '[-]')
    test.assertEval(function () {
      return document.querySelector('#demo ul ul').children.length === 5
    })
  })
  .thenClick('.bold', function () {
    test.assertNotVisible('#demo ul')
    test.assertSelectorHasText('#demo li div span', '[+]')
  })
  .thenClick('.bold', function () {
    test.assertVisible('#demo ul')
    test.assertSelectorHasText('#demo li div span', '[-]')
  })
  .then(function () {
    casper.mouseEvent('dblclick', '#demo ul > .item div')
  })
  .then(function () {
    test.assertElementCount('.item', 13)
    test.assertElementCount('.item > ul', 5)
    test.assertSelectorHasText('#demo ul > .item:nth-child(1)', '[-]')
    test.assertEval(function () {
      var firstItem = document.querySelector('#demo ul > .item:nth-child(1)')
      var ul = firstItem.querySelector('ul')
      return ul.children.length === 2
    })
  })
  // run
  .run(function () {
    test.done()
  })
})
