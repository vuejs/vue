/* global demo */

casper.test.begin('Repeated Items', 50, function (test) {
    
    casper
    .start('./fixtures/repeated-items.html')
    .then(function () {

        // initial values
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 A')
        test.assertSelectorHasText('.item:nth-child(2)', '1 B')
        test.assertSelectorHasText('.item:nth-child(3)', '2 C')

    })
    .thenClick('.push', function () {
        test.assertSelectorHasText('.count', '4')
        test.assertSelectorHasText('.item:nth-child(4)', '3 0')
    })
    .thenClick('.shift', function () {
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 B')
        test.assertSelectorHasText('.item:nth-child(2)', '1 C')
        test.assertSelectorHasText('.item:nth-child(3)', '2 0')
    })
    .thenClick('.pop', function () {
        test.assertSelectorHasText('.count', '2')
        test.assertSelectorHasText('.item:nth-child(1)', '0 B')
        test.assertSelectorHasText('.item:nth-child(2)', '1 C')
    })
    .thenClick('.unshift', function () {
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 B')
        test.assertSelectorHasText('.item:nth-child(3)', '2 C')
    })
    .thenClick('.splice', function () {
        test.assertSelectorHasText('.count', '4')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 3')
        test.assertSelectorHasText('.item:nth-child(4)', '3 C')
    })
    .thenClick('.remove', function () {
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 3')
    })
    .thenClick('.set', function () {
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 4')
    })
    .thenClick('.reverse', function () {
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 4')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 1')
    })
    .thenClick('.sort', function () {
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 1')
        test.assertSelectorHasText('.item:nth-child(2)', '1 2')
        test.assertSelectorHasText('.item:nth-child(3)', '2 4')
    })
    .then(function () {
        // make sure things work on empty array
        this.click('.pop')
        this.click('.pop')
        this.click('.pop')
        this.click('.pop')
        this.click('.shift')
        this.click('.remove')
        this.click('.sort')
        this.click('.reverse')
        this.click('.splice')
    })
    .then(function () {
        test.assertSelectorHasText('.count', '2')
        test.assertSelectorHasText('.item:nth-child(1)', '0 5')
        test.assertSelectorHasText('.item:nth-child(2)', '1 6')
    })
    // test swap entire array
    .thenEvaluate(function () {
        demo.items = [{title:'A'}, {title:'B'}, {title:'C'}]
    })
    .then(function () {
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 A')
        test.assertSelectorHasText('.item:nth-child(2)', '1 B')
        test.assertSelectorHasText('.item:nth-child(3)', '2 C')
    })
    // test swap array with old elements
    // should reuse existing VMs!
    .thenEvaluate(function () {
        window.oldVMs = demo.$.items
        demo.items = [demo.items[2],demo.items[1],demo.items[0]]
    })
    .then(function () {
        test.assertSelectorHasText('.count', '3')
        test.assertSelectorHasText('.item:nth-child(1)', '0 C')
        test.assertSelectorHasText('.item:nth-child(2)', '1 B')
        test.assertSelectorHasText('.item:nth-child(3)', '2 A')
        test.assertEval(function () {
            var i = window.oldVMs.length
            while (i--) {
                if (window.oldVMs[i] !== demo.$.items[2 - i]) {
                    return false
                }
            }
            return true
        })
    })
    .run(function () {
        test.done()
    })

})