casper.test.begin('CSS Transition', 37, function (test) {

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
    })
    .thenClick('.splice')
    .wait(minWait, function () {
        test.assertVisible('.test[data-id="99"]')
    })
    // test Array swapping with transition
    .thenEvaluate(function () {
        test.items = [{a:1}, {a:2}, {a:3}, {a:4}, {a:5}]
    })
    .wait(minWait, function () {
        test.assertVisible('.test.if')
        test.assertElementCount('.test', 7)
        test.assertElementCount('.test[data-id="99"].v-leave', 1)
        test.assertNotVisible('.test[data-id="1"]')
        test.assertNotVisible('.test[data-id="2"]')
        test.assertVisible('.test[data-id="3"]')
        test.assertVisible('.test[data-id="4"]')
        test.assertVisible('.test[data-id="5"]')
    })
    .wait(transDuration, function () {
        // old one should be removed now
        test.assertElementCount('.test', 6)
        test.assertElementCount('.test.v-leave', 0)
        test.assertElementCount('.test[data-id="99"]', 0)
    })
    // test Array diffing with transition
    .thenEvaluate(function () {
        test.items = [test.items[4], {a:6}, test.items[2], {a:7}, test.items[0]]
    })
    .wait(minWait, function () {
        // reusing 3 existing, one of the destroyed (a=2) is hidden, so only 1 item should be leaving
        test.assertElementCount('.test.v-leave', 1)
        // only 2 new items should be in the DOM, the hidden element is removed immediately
        // so should have 5 + 1 + 1 = 7 items
        test.assertElementCount('.test', 7)
    })
    .wait(transDuration, function () {
        test.assertElementCount('.test.v-leave', 0)
        test.assertElementCount('.test', 6)
        test.assertSelectorHasText('li.test:nth-child(1)', '5')
        test.assertSelectorHasText('li.test:nth-child(2)', '6')
        test.assertSelectorHasText('li.test:nth-child(3)', '3')
        test.assertSelectorHasText('li.test:nth-child(4)', '7')
        test.assertSelectorHasText('li.test:nth-child(5)', '1')
        test.assertNotVisible('li.test:nth-child(5)')
    })
    .run(function () {
        test.done()
    })

})