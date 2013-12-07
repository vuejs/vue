casper.test.begin('Transition', 23, function (test) {

    var minWait = 50,
        transDuration = 200
    
    casper
    .start('./fixtures/transition.html', function () {
        test.assertElementCount('.test', 3)
        test.assertNotVisible('.test[data-id="1"]')
    })
    .thenClick('.button-0')
    .wait(minWait, function () {
        test.assertElementCount('.test', 4)
        test.assertVisible('.test[data-id="1"]')
    })
    .thenClick('.button-1')
    .wait(minWait, function () {
        test.assertElementCount('.test', 4)
        test.assertElementCount('.test.v-leave', 2)
    })
    .wait(transDuration, function () {
        test.assertElementCount('.test', 3)
        test.assertElementCount('.test.v-leave', 0)
        test.assertNotVisible('.test[data-id="1"]')
    })
    .thenClick('.button-2')
    .wait(minWait, function () {
        test.assertElementCount('.test', 3)
        test.assertElementCount('.test.v-leave', 2)
    })
    .wait(transDuration, function () {
        test.assertElementCount('.test', 2)
        test.assertNotVisible('.test[data-id="1"]')
        test.assertNotVisible('.test[data-id="2"]')
    })
    .thenClick('.push')
    .wait(minWait, function () {
        test.assertElementCount('.test', 4)
        test.assertVisible('.test[data-id="3"]')
    })
    .thenClick('.pop')
    .wait(minWait, function () {
        test.assertElementCount('.test', 4)
        test.assertElementCount('.test.v-leave', 2)
    })
    .wait(transDuration, function () {
        test.assertElementCount('.test', 2)
        test.assertNotVisible('.test[data-id="1"]')
        test.assertNotVisible('.test[data-id="2"]')
    })
    .thenClick('.splice')
    .wait(minWait, function () {
        test.assertElementCount('.test', 4)
        test.assertVisible('.test[data-id="99"]')
    })
    .run(function () {
        test.done()
    })

})