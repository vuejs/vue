module.exports = {
  'v-model work with extra whitespace properties': function (browser) {
    browser
    .url('http://localhost:8080/examples/v-model/')
      .waitForElementVisible('#app', 1000)
      .assert.value('input', 'test')
      .setValue('input', '1')
      .assert.value('input', 'test1')
      .assert.containsText('.extra-spaces', '')
      .end()
  }
}
