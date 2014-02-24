casper.test.begin('CSS Animation', 7, function (test) {

    var minWait = 50,
        duration = 200
    
    casper
    .start('./fixtures/animation.html')
    .then(function () {
        test.assertElementCount('h1', 1)
        test.assertElementCount('h1.v-leave', 0)
    })
    .thenClick('button')
    .wait(minWait, function () {
        test.assertElementCount('h1.v-leave', 1)
    })
    .wait(duration, function () {
        test.assertElementCount('h1', 0)
    })
    .thenClick('button')
    .wait(minWait, function () {
        test.assertElementCount('h1.v-enter', 1)
    })
    .wait(duration, function () {
        test.assertElementCount('h1', 1)
        test.assertElementCount('h1.v-enter', 0)
    })
    .run(function () {
        test.done()
    })

})