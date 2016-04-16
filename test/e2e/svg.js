/* global stats, valueToPoint */
casper.on("page.error", function(msg, trace) {
  console.log(JSON.stringify(trace, null, 2))
})

casper.test.begin('svg', 18, function (test) {
  casper
  .start('examples/svg/index.html')
  .then(function () {
    test.assertElementCount('g', 1)
    test.assertElementCount('polygon', 1)
    test.assertElementCount('circle', 1)
    test.assertElementCount('text', 6)
    test.assertElementCount('label', 6)
    test.assertElementCount('button', 7)
    test.assertElementCount('input[type="range"]', 6)
    test.assertEval(function () {
      var points = stats.map(function (stat, i) {
        var point = valueToPoint(stat.value, i, 6)
        return point.x + ',' + point.y
      }).join(' ')
      return document.querySelector('polygon').attributes[0].value === points
    })
  })
  .thenClick('button.remove', function () {
    test.assertElementCount('text', 5)
    test.assertElementCount('label', 5)
    test.assertElementCount('button', 6)
    test.assertElementCount('input[type="range"]', 5)
    test.assertEval(function () {
      var points = stats.map(function (stat, i) {
        var point = valueToPoint(stat.value, i, 5)
        return point.x + ',' + point.y
      }).join(' ')
      return document.querySelector('polygon').attributes[0].value === points
    })
  })
  .then(function () {
    this.fill('#add', {
      newlabel: 'foo'
    })
  })
  .thenClick('#add > button', function () {
    test.assertElementCount('text', 6)
    test.assertElementCount('label', 6)
    test.assertElementCount('button', 7)
    test.assertElementCount('input[type="range"]', 6)
    test.assertEval(function () {
      var points = stats.map(function (stat, i) {
        var point = valueToPoint(stat.value, i, 6)
        return point.x + ',' + point.y
      }).join(' ')
      return document.querySelector('polygon').attributes[0].value === points
    })
  })
  // run
  .run(function () {
    test.done()
  })
})
