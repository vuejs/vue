casper.test.begin('markdown', 4, function (test) {
  
  casper
  .start('../../examples/markdown/index.html')
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
      '- hi\n\n'
    )
    // keyUp(13)
  })
  .then(function () {
    test.assertEval(function () {
      return document.querySelector('textarea').value
        === '## yo\n\n- test\n- hi\n\n# hello'
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