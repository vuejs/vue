module.exports = {
  'commits': function (browser) {
    browser
    .url('http://localhost:8080/examples/commits/')
      .waitForElementVisible('li', 1000)
      .assert.elementCount('input', 2)
      .assert.elementCount('label', 2)
      .assert.containsText('label[for="master"]', 'master')
      .assert.containsText('label[for="dev"]', 'dev')
      .assert.checked('#master')
      .assert.checked('#dev', false)
      .assert.containsText('p', 'vuejs/vue@master')
      .assert.elementCount('li', 3)
      .assert.elementCount('li .commit', 3)
      .assert.elementCount('li .message', 3)
      .end()
  }
}
