casper.test.begin('grid', 73, function (test) {
  casper
  .start('examples/grid/index.html')
  .then(function () {
    // headers
    test.assertElementCount('th', 2)
    test.assertElementCount('th.active', 0)
    test.assertSelectorHasText('th:nth-child(1)', 'Name')
    test.assertSelectorHasText('th:nth-child(2)', 'Power')
    assertTable(test, ['name', 'power'], [
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ])
  })
  // test sorting
  .thenClick('th:nth-child(1)', function () {
    test.assertElementCount('th.active:nth-child(1)', 1)
    test.assertElementCount('th.active:nth-child(2)', 0)
    test.assertElementCount('th:nth-child(1) .arrow.dsc', 1)
    test.assertElementCount('th:nth-child(2) .arrow.dsc', 0)
    assertTable(test, ['name', 'power'], [
      { name: 'Jet Li', power: 8000 },
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 }
    ])
  })
  .thenClick('th:nth-child(2)', function () {
    test.assertElementCount('th.active:nth-child(1)', 0)
    test.assertElementCount('th.active:nth-child(2)', 1)
    test.assertElementCount('th:nth-child(1) .arrow.dsc', 1)
    test.assertElementCount('th:nth-child(2) .arrow.dsc', 1)
    assertTable(test, ['name', 'power'], [
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Jet Li', power: 8000 },
      { name: 'Jackie Chan', power: 7000 }
    ])
  })
  .thenClick('th:nth-child(2)', function () {
    test.assertElementCount('th.active:nth-child(1)', 0)
    test.assertElementCount('th.active:nth-child(2)', 1)
    test.assertElementCount('th:nth-child(1) .arrow.dsc', 1)
    test.assertElementCount('th:nth-child(2) .arrow.asc', 1)
    assertTable(test, ['name', 'power'], [
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Jet Li', power: 8000 },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Chuck Norris', power: Infinity }
    ])
  })
  .thenClick('th:nth-child(1)', function () {
    test.assertElementCount('th.active:nth-child(1)', 1)
    test.assertElementCount('th.active:nth-child(2)', 0)
    test.assertElementCount('th:nth-child(1) .arrow.asc', 1)
    test.assertElementCount('th:nth-child(2) .arrow.asc', 1)
    assertTable(test, ['name', 'power'], [
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ])
  })
  // test search
  .then(function () {
    this.fill('#search', {
      query: 'j'
    })
  })
  .then(function () {
    assertTable(test, ['name', 'power'], [
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ])
  })
  .then(function () {
    this.fill('#search', {
      query: 'infinity'
    })
  })
  .then(function () {
    assertTable(test, ['name', 'power'], [
      { name: 'Chuck Norris', power: Infinity }
    ])
  })
  // run
  .run(function () {
    test.done()
  })

  /**
   * Helper to assert the table data is rendered correctly.
   *
   * @param {CasperTester} test
   * @param {Array} columns
   * @param {Array} data
   */

  function assertTable (test, columns, data) {
    test.assertElementCount('td', data.length * columns.length)
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < columns.length; j++) {
        test.assertSelectorHasText(
          'tr:nth-child(' + (i + 1) + ') td:nth-child(' + (j + 1) + ')',
          data[i][columns[j]]
        )
      }
    }
  }
})
