casper.test.begin('CSS Transition', 20, function (test) {

    var minWait = 50,
        transDuration = 200
    
    casper
    .start('./fixtures/transition.html', function () {
        test.assertElementCount('.test', 3)
        test.assertVisible('.test.if')
        test.assertNotVisible('.test[data-id="1"]')
    })
    .thenClick('.button-0')
    .wait(minWait, function () {
        test.assertVisible('.test[data-id="1"]')
    })
    .thenClick('.button-1')
    .wait(minWait, function () {
        test.assertElementCount('.test.v-leave', 1)
    })
    .wait(transDuration, function () {
        test.assertElementCount('.test.v-leave', 0)
        test.assertNotVisible('.test[data-id="1"]')
    })
    .thenClick('.button-2')
    .wait(minWait, function () {
        test.assertElementCount('.test.v-leave', 1)
    })
    .wait(transDuration, function () {
        test.assertElementCount('.test.v-leave', 0)
        test.assertNotVisible('.test[data-id="1"]')
        test.assertNotVisible('.test[data-id="2"]')
    })
    .thenClick('.push')
    .wait(minWait, function () {
        test.assertVisible('.test[data-id="3"]')
    })
    .thenClick('.pop')
    .thenClick('.pop')
    .wait(minWait, function () {
        test.assertElementCount('.test.v-leave', 2)
    })
    .wait(transDuration, function () {
        test.assertNotVisible('.test.if')
        test.assertNotVisible('.test[data-id="1"]')
        test.assertNotVisible('.test[data-id="2"]')
    })
    .thenClick('.splice')
    .wait(minWait, function () {
        test.assertVisible('.test[data-id="99"]')
    })
    // test Array swapping with transition
    .thenEvaluate(function () {
        test.items = [test.items[1], {a:3}]
    })
    .wait(minWait, function () {
        test.assertVisible('.test.if')
        test.assertVisible('.test[data-id="99"]')
        test.assertVisible('.test[data-id="3"]')
    })
    .run(function () {
        test.done()
    })

})