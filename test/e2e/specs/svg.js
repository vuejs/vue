module.exports = {
  'svg': function (browser) {
    browser
    .url('http://localhost:8080/examples/svg/')
      .waitForElementVisible('svg', 1000)
      .assert.elementCount('g', 1)
      .assert.elementCount('polygon', 1)
      .assert.elementCount('circle', 1)
      .assert.elementCount('text', 6)
      .assert.elementCount('label', 6)
      .assert.elementCount('button', 7)
      .assert.elementCount('input[type="range"]', 6)
      .assert.evaluate(function () {
        var points = stats.map(function (stat, i) {
        var point = valueToPoint(stat.value, i, 6)
          return point.x + ',' + point.y
        }).join(' ')
        return document.querySelector('polygon').attributes[0].value === points
      })
      .click('button.remove')
      .assert.elementCount('text', 5)
      .assert.elementCount('label', 5)
      .assert.elementCount('button', 6)
      .assert.elementCount('input[type="range"]', 5)
      .assert.evaluate(function () {
        var points = stats.map(function (stat, i) {
        var point = valueToPoint(stat.value, i, 5)
          return point.x + ',' + point.y
        }).join(' ')
        return document.querySelector('polygon').attributes[0].value === points
      })
      .setValue('input[name="newlabel"]', 'foo')
      .click('#add > button')
      .assert.elementCount('text', 6)
      .assert.elementCount('label', 6)
      .assert.elementCount('button', 7)
      .assert.elementCount('input[type="range"]', 6)
      .assert.evaluate(function () {
        var points = stats.map(function (stat, i) {
        var point = valueToPoint(stat.value, i, 6)
          return point.x + ',' + point.y
        }).join(' ')
        return document.querySelector('polygon').attributes[0].value === points
      })
      .end()
  }
}
