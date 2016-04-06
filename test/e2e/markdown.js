casper.test.begin('markdown', 5, function (test) {
  casper
  .start('examples/markdown/index.html')
  .then(function () {
    test.assertEval(function () {
      return document.querySelector('textarea').value === '# hello'
    })
    test.assertEval(function () {
      return document.querySelector('#editor div')
        .innerHTML === '<h1 id="hello">hello</h1>\n'
    })
  })
  .then(function () {
    this.sendKeys(
      'textarea',
      '## foo\n\n' +
      '- bar\n' +
      '- baz\n\n',
      { keepFocus: true }
    )
    // keyUp(13)
  })
  .then(function () {
    // assert the output is not updated yet because of
    // debounce
    test.assertEval(function () {
      return document.querySelector('#editor div')
        .innerHTML === '<h1 id="hello">hello</h1>\n'
    })
  })
  .wait(300) // wait for debounce
  .then(function () {
    test.assertEval(function () {
      return document.querySelector('textarea').value ===
        '## foo\n\n- bar\n- baz\n\n# hello'
    })
    test.assertEval(function () {
      return document.querySelector('#editor div')
        .innerHTML ===
          '<h2 id="foo">foo</h2>\n' +
          '<ul>\n<li>bar</li>\n<li>baz</li>\n</ul>\n' +
          '<h1 id="hello">hello</h1>\n'
    })
  })
  // run
  .run(function () {
    test.done()
  })
})
