module.exports = {
  'markdown': function (browser) {
    browser
    .url('http://localhost:8080/examples/markdown/')
      .waitForElementVisible('#editor', 1000)
      .assert.elementPresent('#editor')
      .end()
  }
}
