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
      '## yo\n\n' +
      '- test\n' +
      '- hi\n\n',
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
        '## yo\n\n- test\n- hi\n\n# hello'
    })
    test.assertEval(function () {
      return document.querySelector('#editor div')
        .innerHTML ===
          '<h2 id="yo">yo</h2>\n' +
          '<ul>\n<li>test</li>\n<li>hi</li>\n</ul>\n' +
          '<h1 id="hello">hello</h1>\n'
    })
  })
  // run
  .run(function () {
    test.done()
  })

})
