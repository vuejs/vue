// PhantomJS has pretty poor CSS3 support so we're just
// testing the content transclusion here

casper.test.begin('slider', 2, function (test) {
  
  casper
  .start('../../examples/slider/index.html')
  .then(function () {
    test.assertElementCount('article img', 4)
    test.assertEval(function () {
      var ok = true
      var images = ['rock', 'grooves', 'arch', 'sunset']
      for (var i = 1; i < 5; i++) {
        var img = document.querySelector('article:nth-child(' + i + ')').children[0]
        if (img.src.indexOf(images[i - 1]) < 0) {
          ok = false
        }
      }
      return ok
    })
  })
  // run
  .run(function () {
    test.done()
  })

})